import os
import re
import json
import sqlite3
from datetime import datetime
from uuid import uuid4
from fpdf import FPDF
from flask import Flask, render_template, request, redirect, url_for, jsonify, send_file, abort

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
INSTANCE_DIR = os.path.join(BASE_DIR, 'instance')
UPLOAD_DIR = os.path.join(BASE_DIR, 'uploads')
DB_PATH = os.path.join(INSTANCE_DIR, 'app.db')

os.makedirs(INSTANCE_DIR, exist_ok=True)
os.makedirs(UPLOAD_DIR, exist_ok=True)

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_DIR
app.config['MAX_CONTENT_LENGTH'] = 6 * 1024 * 1024
app.config['SECRET_KEY'] = 'change-me'

GRADE_POINTS = {
    'A': 4.0,
    'A-': 3.7,
    'B+': 3.3,
    'B': 3.0,
    'B-': 2.7,
    'C+': 2.3,
    'C': 2.0,
    'C-': 1.7,
    'D': 1.0,
    'F': 0.0,
}

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
PHONE_RE = re.compile(r"^[\d\s\-\+\(\)]+$")


def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db_connection()
    conn.execute(
        '''
        CREATE TABLE IF NOT EXISTS applications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            application_id TEXT UNIQUE NOT NULL,
            submitted_on TEXT NOT NULL,
            data JSON NOT NULL,
            resume_filename TEXT NOT NULL
        )
        '''
    )
    conn.commit()
    conn.close()


init_db()


def generate_application_id():
    now = datetime.now()
    suffix = str(uuid4().int)[-5:]
    return f"INT-{now.year}-{suffix}"


def allowed_resume(filename):
    if not filename:
        return False
    ext = filename.rsplit('.', 1)[-1].lower()
    return ext in {'pdf', 'doc', 'docx'}


@app.route('/')
def home():
    return redirect(url_for('page', step=1))


@app.route('/page/<int:step>')
def page(step):
    if step < 1 or step > 4:
        return redirect(url_for('page', step=1))
    return render_template(f'page{step}.html', step=step)


@app.route('/submit', methods=['POST'])
def submit():
    data_payload = request.form.get('application_data') or request.get_json(silent=True)
    if not data_payload:
        return jsonify({'success': False, 'message': 'No application data provided.'}), 400

    try:
        if isinstance(data_payload, str):
            data = json.loads(data_payload)
        else:
            data = data_payload
    except ValueError:
        return jsonify({'success': False, 'message': 'Invalid JSON application payload.'}), 400

    resume_file = request.files.get('resume')
    if not resume_file or resume_file.filename == '':
        return jsonify({'success': False, 'message': 'Resume file is required.'}), 400
    if not allowed_resume(resume_file.filename):
        return jsonify({'success': False, 'message': 'Resume must be PDF or DOC/DOCX.'}), 400

    filename = f"{uuid4().hex}_{resume_file.filename}"
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    resume_file.save(file_path)

    now = datetime.now()
    application_id = generate_application_id()
    submitted_on = now.isoformat()
    data_record = {
        'full_name': data.get('full_name', ''),
        'email': data.get('email', ''),
        'phone': data.get('phone', ''),
        'university': data.get('university', ''),
        'major': data.get('major', ''),
        'graduation_date': data.get('graduation_date', ''),
        'courses': data.get('courses', []),
        'gpa': data.get('gpa', ''),
        'experiences': data.get('experiences', []),
        'technical_skills': data.get('technical_skills', []),
        'soft_skills': data.get('soft_skills', []),
        'interest': data.get('interest', ''),
        'availability': data.get('availability', ''),
        'additional_notes': data.get('additional_notes', ''),
    }

    conn = get_db_connection()
    conn.execute(
        'INSERT INTO applications (application_id, submitted_on, data, resume_filename) VALUES (?, ?, ?, ?)',
        (application_id, submitted_on, json.dumps(data_record), filename)
    )
    conn.commit()
    conn.close()

    return jsonify({'success': True, 'application_id': application_id})


@app.route('/confirmation/<application_id>')
def confirmation(application_id):
    conn = get_db_connection()
    row = conn.execute('SELECT * FROM applications WHERE application_id = ?', (application_id,)).fetchone()
    conn.close()
    if row is None:
        abort(404)

    record = json.loads(row['data'])
    submitted_on = datetime.fromisoformat(row['submitted_on'])
    summary = {
        'application_id': row['application_id'],
        'submitted_on': submitted_on.strftime('%B %d, %Y at %I:%M %p'),
        'name': record.get('full_name', ''),
        'email': record.get('email', ''),
        'university': record.get('university', ''),
        'gpa': record.get('gpa', ''),
        'technical_skills_count': len(record.get('technical_skills', [])),
        'interest': record.get('interest', ''),
        'availability': record.get('availability', ''),
    }
    return render_template('confirmation.html', summary=summary)


@app.route('/download/<application_id>')
def download(application_id):
    conn = get_db_connection()
    row = conn.execute('SELECT * FROM applications WHERE application_id = ?', (application_id,)).fetchone()
    conn.close()
    if row is None:
        abort(404)

    record = json.loads(row['data'])
    pdf_filename = f'application_{application_id}.pdf'
    pdf_path = os.path.join(INSTANCE_DIR, pdf_filename)

    def pdf_safe(value):
        text = str(value or '')
        replacements = {
            '\u2013': '-',
            '\u2014': '-',
            '\u2018': "'",
            '\u2019': "'",
            '\u201c': '"',
            '\u201d': '"',
            '\u2026': '...',
            '\u2022': '*',
            '\xa0': ' ',
        }
        for key, replacement in replacements.items():
            text = text.replace(key, replacement)
        return text.encode('latin-1', 'replace').decode('latin-1')

    pdf = FPDF()
    pdf.add_page()
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.set_font('Arial', 'B', 16)
    pdf.cell(0, 10, pdf_safe('Internship Application Summary'), ln=True)
    pdf.set_font('Arial', '', 12)
    pdf.ln(5)

    def add_line(label, value):
        pdf.set_font('Arial', 'B', 11)
        pdf.cell(0, 6, pdf_safe(f'{label}:'), ln=True)
        pdf.set_font('Arial', '', 11)
        pdf.multi_cell(0, 6, pdf_safe(value) or 'N/A')
        pdf.ln(2)

    add_line('Application ID', application_id)
    add_line('Submitted on', row['submitted_on'])
    add_line('Name', record.get('full_name', ''))
    add_line('Email', record.get('email', ''))
    add_line('University', record.get('university', ''))
    add_line('Major', record.get('major', ''))
    add_line('Graduation Date', record.get('graduation_date', ''))
    add_line('GPA', record.get('gpa', ''))
    add_line('Technical Skills', ', '.join(record.get('technical_skills', [])))
    add_line('Soft Skills', ', '.join(record.get('soft_skills', [])))
    add_line('Interest', record.get('interest', ''))
    add_line('Availability', record.get('availability', ''))

    pdf.output(pdf_path)
    return send_file(pdf_path, as_attachment=True, download_name=pdf_filename)


if __name__ == '__main__':
    app.run(debug=True)
