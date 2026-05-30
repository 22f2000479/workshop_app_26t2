const STORAGE_KEY = 'internshipApplicationDraft';
const GRADE_POINTS = {A: 4.0, 'A-': 3.7, 'B+': 3.3, B: 3.0, 'B-': 2.7, 'C+': 2.3, C: 2.0, 'C-': 1.7, D: 1.0, F: 0.0};

function getDraft() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch (error) {
    return {};
  }
}

function saveDraft(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function clearDraft() {
  localStorage.removeItem(STORAGE_KEY);
}

function setValue(id, value) {
  const el = document.getElementById(id);
  if (el) {
    el.value = value || '';
  }
}

function getValue(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : '';
}

function setChecked(id, checked) {
  const el = document.getElementById(id);
  if (el) el.checked = !!checked;
}

function initPage(step) {
  const draft = getDraft();
  if (step === 1) initPage1(draft);
  if (step === 2) initPage2(draft);
  if (step === 3) initPage3(draft);
  if (step === 4) initPage4(draft);
}

function validateEmail(value) {
  return /^\S+@\S+\.\S+$/.test(value);
}

function validatePhone(value) {
  return true;
}

function showError(id, message) {
  const el = document.getElementById(id);
  if (el) el.textContent = message || '';
}

function toggleButton(id, enabled) {
  const btn = document.getElementById(id);
  if (btn) btn.disabled = !enabled;
}

function updateProgress(step) {
  const progress = document.getElementById('progress-bar');
  if (progress) {
    progress.style.width = `${step * 20}%`;
  }
}

function initPage1(draft) {
  updateProgress(1);
  setValue('full_name', draft.full_name);
  setValue('email', draft.email);
  setValue('phone', draft.phone);
  const university = draft.university || '';
  const uniSelect = document.getElementById('university');
  if (uniSelect) uniSelect.value = university;
  setValue('major', draft.major);
  setValue('graduation_date', draft.graduation_date);
  const resumeLabel = document.getElementById('resume-name');
  if (resumeLabel) resumeLabel.textContent = draft.resume_name || 'No file chosen';
  const charInfo = document.getElementById('name-count');
  if (charInfo) charInfo.textContent = `${(draft.full_name || '').length}/100`;
  validatePage1();
}

function validatePage1() {
  const name = getValue('full_name');
  const email = getValue('email');
  const phone = getValue('phone');
  const university = getValue('university');
  const major = getValue('major');
  const graduation = getValue('graduation_date');

  let valid = true;
  showError('error-name', '');
  showError('error-email', '');
  showError('error-phone', '');
  showError('error-university', '');
  showError('error-major', '');
  showError('error-graduation', '');
  showError('error-resume', '');

  if (name.length < 3 || name.length > 100) {
    valid = false;
    showError('error-name', 'Full name must be at least 3 characters.');
  }
  if (!validateEmail(email)) {
    valid = false;
    showError('error-email', 'Enter a valid email address.');
  }
  if (!validatePhone(phone)) {
    valid = false;
    showError('error-phone', 'Enter a valid phone number.');
  }
  if (!university) {
    valid = false;
    showError('error-university', 'University is required.');
  }
  if (major.length < 2) {
    valid = false;
    showError('error-major', 'Major or degree is required.');
  }
  if (!graduation) {
    valid = false;
    showError('error-graduation', 'Expected graduation date is required.');
  } else {
    const dateValue = new Date(graduation);
    const now = new Date();
    const maxDate = new Date();
    maxDate.setFullYear(now.getFullYear() + 2);
    if (dateValue <= now || dateValue > maxDate) {
      valid = false;
      showError('error-graduation', 'Graduation date must be within the next 2 years.');
    }
  }
  const resumeName = document.getElementById('resume-name').textContent;
  if (!resumeName || resumeName === 'No file chosen') {
    valid = false;
  }
  toggleButton('next-button', valid);
  return valid;
}

function savePage1() {
  const draft = getDraft();
  draft.full_name = getValue('full_name');
  draft.email = getValue('email');
  draft.phone = getValue('phone');
  draft.university = getValue('university');
  draft.major = getValue('major');
  draft.graduation_date = getValue('graduation_date');
  saveDraft(draft);
}

function dataURLtoBlob(dataURL) {
  const [header, data] = dataURL.split(',');
  const mime = header.match(/:(.*?);/)[1];
  const binary = atob(data);
  const array = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) array[i] = binary.charCodeAt(i);
  return new Blob([array], { type: mime });
}

function handleResumeFile(input) {
  const label = document.getElementById('resume-name');
  if (!input.files || !input.files[0]) return;
  const file = input.files[0];
  const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  if (!validTypes.includes(file.type) && !file.name.match(/\.(pdf|doc|docx)$/i)) {
    showError('error-resume', 'Resume must be a PDF or Word document.');
    input.value = '';
    label.textContent = 'No file chosen';
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    showError('error-resume', 'Resume must be 5MB or less.');
    input.value = '';
    label.textContent = 'No file chosen';
    return;
  }
  showError('error-resume', '');
  label.textContent = file.name;
  const reader = new FileReader();
  reader.onload = () => {
    const draft = getDraft();
    draft.resume_name = file.name;
    draft.resume_data = reader.result;
    saveDraft(draft);
    validatePage1();
  };
  reader.readAsDataURL(file);
}

function removeResume() {
  const input = document.getElementById('resume');
  if (input) input.value = '';
  document.getElementById('resume-name').textContent = 'No file chosen';
  const draft = getDraft();
  delete draft.resume_name;
  delete draft.resume_data;
  saveDraft(draft);
  validatePage1();
}

function nextPage(current) {
  if (current === 1 && !validatePage1()) return;
  if (current === 1) savePage1();
  if (current === 2 && !validatePage2()) return;
  if (current === 2) savePage2();
  if (current === 3) savePage3();
  if (current === 4 && !validatePage4()) return;
  if (current === 4) savePage4();
  window.location.href = `/page/${current + 1}`;
}

function prevPage(current) {
  if (current === 2) savePage2();
  if (current === 3) savePage3();
  if (current === 4) savePage4();
  window.location.href = `/page/${current - 1}`;
}

function initPage2(draft) {
  updateProgress(2);
  draft.courses = draft.courses || [];
  setValue('course_name', draft.current_course?.name);
  setValue('course_code', draft.current_course?.code);
  const gradeSelect = document.getElementById('course_grade');
  if (gradeSelect) gradeSelect.value = draft.current_course?.grade || '';
  const semSelect = document.getElementById('course_semester');
  if (semSelect) semSelect.value = draft.current_course?.semester || '';
  renderCourseTable(draft.courses);
  updateCourseSummary(draft.courses);
  validatePage2();
}

function updateCourseSummary(courses) {
  const gpaEl = document.getElementById('current-gpa');
  const countEl = document.getElementById('course-count');
  const gpa = calculateGPA(courses);
  if (gpaEl) gpaEl.textContent = gpa.toFixed(2);
  if (countEl) countEl.textContent = courses.length;
}

function calculateGPA(courses) {
  const points = courses.filter(c => GRADE_POINTS.hasOwnProperty(c.grade)).map(c => GRADE_POINTS[c.grade]);
  if (!points.length) return 0.0;
  return points.reduce((sum, value) => sum + value, 0) / points.length;
}

function renderCourseTable(courses) {
  const tbody = document.getElementById('courses-body');
  tbody.innerHTML = '';
  courses.forEach((course, index) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${escapeHtml(course.name)}</td>
      <td>${escapeHtml(course.code || '—')}</td>
      <td>${escapeHtml(course.grade)}</td>
      <td>${escapeHtml(course.semester || '—')}</td>
      <td><button type="button" class="btn secondary" onclick="removeCourse(${index})">Remove</button></td>
    `;
    tbody.appendChild(tr);
  });
}

function escapeHtml(value) {
  return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function addCourse() {
  const name = getValue('course_name');
  const code = getValue('course_code');
  const grade = getValue('course_grade');
  const semester = getValue('course_semester');
  showError('error-course', '');
  if (name.length < 3 || name.length > 100) {
    showError('error-course', 'Course name must be at least 3 characters.');
    return;
  }
  if (!grade) {
    showError('error-course', 'Select a valid grade.');
    return;
  }
  const draft = getDraft();
  draft.courses = draft.courses || [];
  if (draft.courses.length >= 10) {
    showError('error-course', 'Maximum 10 courses allowed.');
    return;
  }
  draft.courses.push({name, code, grade, semester});
  draft.gpa = calculateGPA(draft.courses).toFixed(2);
  saveDraft(draft);
  renderCourseTable(draft.courses);
  updateCourseSummary(draft.courses);
  document.getElementById('course_name').value = '';
  document.getElementById('course_code').value = '';
  document.getElementById('course_grade').value = '';
  document.getElementById('course_semester').value = '';
  validatePage2();
}

function removeCourse(index) {
  const draft = getDraft();
  draft.courses = draft.courses || [];
  draft.courses.splice(index, 1);
  draft.gpa = calculateGPA(draft.courses).toFixed(2);
  saveDraft(draft);
  renderCourseTable(draft.courses);
  updateCourseSummary(draft.courses);
  validatePage2();
}

function validatePage2() {
  const draft = getDraft();
  const courses = draft.courses || [];
  const valid = courses.length >= 2;
  showError('error-course-min', valid ? '' : 'Please add at least 2 courses before continuing.');
  toggleButton('next-button', valid);
  return valid;
}

function savePage2() {
  const draft = getDraft();
  draft.courses = draft.courses || [];
  draft.gpa = calculateGPA(draft.courses).toFixed(2);
  saveDraft(draft);
}

function initPage3(draft) {
  updateProgress(3);
  draft.experiences = draft.experiences || [];
  setValue('job_title', draft.current_experience?.job_title);
  setValue('company_name', draft.current_experience?.company_name);
  setValue('start_date', draft.current_experience?.start_date);
  setValue('end_date', draft.current_experience?.end_date);
  setChecked('current_here', draft.current_experience?.current_here);
  setValue('job_description', draft.current_experience?.description);
  if (draft.current_experience?.current_here) {
    document.getElementById('end_date').disabled = true;
  }
  renderExperienceTable(draft.experiences);
  updateExperienceSummary(draft.experiences);
}

function updateExperienceSummary(experiences) {
  const count = experiences.length;
  const el = document.getElementById('experience-count');
  if (el) el.textContent = `You have added ${count} work experience${count === 1 ? '' : 's'}.`;
}

function renderExperienceTable(experiences) {
  const tbody = document.getElementById('experience-body');
  tbody.innerHTML = '';
  experiences.forEach((exp, index) => {
    const duration = exp.current_here ? `${exp.start_date} – Present` : `${exp.start_date} – ${exp.end_date}`;
    const desc = exp.description ? `${exp.description.slice(0, 100)}${exp.description.length > 100 ? '...' : ''}` : '—';
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${escapeHtml(exp.job_title)}</td>
      <td>${escapeHtml(exp.company_name)}</td>
      <td>${escapeHtml(duration)}</td>
      <td title="${escapeHtml(exp.description || '')}">${escapeHtml(desc)}</td>
      <td>
        <button type="button" class="btn secondary" onclick="editExperience(${index})">Edit</button>
        <button type="button" class="btn danger" onclick="removeExperience(${index})">Remove</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function toggleCurrentHere() {
  const checked = document.getElementById('current_here').checked;
  document.getElementById('end_date').disabled = checked;
}

function addExperience() {
  const jobTitle = getValue('job_title');
  const companyName = getValue('company_name');
  const startDate = getValue('start_date');
  const endDate = getValue('end_date');
  const currentHere = document.getElementById('current_here').checked;
  const description = getValue('job_description');
  showError('error-experience', '');
  if (!jobTitle || jobTitle.length < 3) {
    showError('error-experience', 'Job title is required when adding experience.');
    return;
  }
  if (!companyName || companyName.length < 3) {
    showError('error-experience', 'Company name is required when adding experience.');
    return;
  }
  if (!startDate) {
    showError('error-experience', 'Start date is required.');
    return;
  }
  if (!currentHere && !endDate) {
    showError('error-experience', 'End date is required unless currently working here.');
    return;
  }
  if (!currentHere && new Date(endDate) < new Date(startDate)) {
    showError('error-experience', 'End date must be after start date.');
    return;
  }

  const draft = getDraft();
  draft.experiences = draft.experiences || [];
  const experience = {job_title: jobTitle, company_name: companyName, start_date: startDate, end_date: currentHere ? '' : endDate, current_here: currentHere, description};
  if (draft.edit_index >= 0) {
    draft.experiences[draft.edit_index] = experience;
    delete draft.edit_index;
  } else {
    draft.experiences.push(experience);
  }
  saveDraft(draft);
  renderExperienceTable(draft.experiences);
  updateExperienceSummary(draft.experiences);
  clearExperienceForm();
}

function editExperience(index) {
  const draft = getDraft();
  draft.experiences = draft.experiences || [];
  const exp = draft.experiences[index];
  if (!exp) return;
  draft.edit_index = index;
  saveDraft(draft);
  setValue('job_title', exp.job_title);
  setValue('company_name', exp.company_name);
  setValue('start_date', exp.start_date);
  setValue('end_date', exp.end_date);
  setChecked('current_here', exp.current_here);
  if (exp.current_here) document.getElementById('end_date').disabled = true;
  setValue('job_description', exp.description);
  const addBtn = document.getElementById('add-experience-button');
  if (addBtn) addBtn.textContent = 'Update Experience';
}

function removeExperience(index) {
  const draft = getDraft();
  draft.experiences = draft.experiences || [];
  draft.experiences.splice(index, 1);
  saveDraft(draft);
  renderExperienceTable(draft.experiences);
  updateExperienceSummary(draft.experiences);
}

function clearExperienceForm() {
  document.getElementById('job_title').value = '';
  document.getElementById('company_name').value = '';
  document.getElementById('start_date').value = '';
  document.getElementById('end_date').value = '';
  document.getElementById('current_here').checked = false;
  document.getElementById('end_date').disabled = false;
  document.getElementById('job_description').value = '';
  const addBtn = document.getElementById('add-experience-button');
  if (addBtn) addBtn.textContent = 'Add Experience';
}

function savePage3() {
  const draft = getDraft();
  draft.experiences = draft.experiences || [];
  delete draft.edit_index;
  saveDraft(draft);
}

function initPage4(draft) {
  updateProgress(4);
  draft.technical_skills = draft.technical_skills || [];
  draft.soft_skills = draft.soft_skills || [];
  const technical = draft.technical_skills;
  const soft = draft.soft_skills;
  technical.forEach(skill => {
    const checkbox = document.querySelector(`input[name="technical_skills"][value="${skill}"]`);
    if (checkbox) checkbox.checked = true;
  });
  soft.forEach(skill => {
    const checkbox = document.querySelector(`input[name="soft_skills"][value="${skill}"]`);
    if (checkbox) checkbox.checked = true;
  });
  const interest = draft.interest || '';
  const availability = draft.availability || '';
  const interestInput = document.querySelector(`input[name="interest"][value="${interest}"]`);
  if (interestInput) interestInput.checked = true;
  const availInput = document.querySelector(`input[name="availability"][value="${availability}"]`);
  if (availInput) availInput.checked = true;
  setValue('additional_notes', draft.additional_notes);
  updateSkillsCount();
  validatePage4();
}

function updateSkillsCount() {
  const selectedTech = document.querySelectorAll('input[name="technical_skills"]:checked').length;
  const selectedSoft = document.querySelectorAll('input[name="soft_skills"]:checked').length;
  const techCount = document.getElementById('tech-count');
  const softCount = document.getElementById('soft-count');
  if (techCount) techCount.textContent = selectedTech;
  if (softCount) softCount.textContent = selectedSoft;
}

function validatePage4() {
  const techChecked = document.querySelectorAll('input[name="technical_skills"]:checked').length;
  const softChecked = document.querySelectorAll('input[name="soft_skills"]:checked').length;
  const interest = document.querySelector('input[name="interest"]:checked');
  const availability = document.querySelector('input[name="availability"]:checked');
  let valid = true;
  showError('error-technical', '');
  showError('error-soft', '');
  showError('error-interest', '');
  showError('error-availability', '');

  if (techChecked < 1) {
    valid = false;
    showError('error-technical', 'Select at least one technical skill.');
  }
  if (softChecked < 1) {
    valid = false;
    showError('error-soft', 'Select at least one soft skill.');
  }
  if (!interest) {
    valid = false;
    showError('error-interest', 'Choose an internship interest.');
  }
  if (!availability) {
    valid = false;
    showError('error-availability', 'Choose your availability.');
  }
  toggleButton('next-button', valid);
  return valid;
}

function savePage4() {
  const draft = getDraft();
  draft.technical_skills = Array.from(document.querySelectorAll('input[name="technical_skills"]:checked')).map(i => i.value);
  draft.soft_skills = Array.from(document.querySelectorAll('input[name="soft_skills"]:checked')).map(i => i.value);
  const interest = document.querySelector('input[name="interest"]:checked');
  const availability = document.querySelector('input[name="availability"]:checked');
  draft.interest = interest ? interest.value : '';
  draft.availability = availability ? availability.value : '';
  draft.additional_notes = getValue('additional_notes');
  saveDraft(draft);
}

function formatReview(draft) {
  const rows = [];
  if (draft.full_name) rows.push(`<p><strong>Name:</strong> ${escapeHtml(draft.full_name)}</p>`);
  if (draft.email) rows.push(`<p><strong>Email:</strong> ${escapeHtml(draft.email)}</p>`);
  if (draft.university) rows.push(`<p><strong>University:</strong> ${escapeHtml(draft.university)}</p>`);
  rows.push(`<p><strong>GPA:</strong> ${escapeHtml(draft.gpa || '0.00')}</p>`);
  rows.push(`<p><strong>Technical Skills:</strong> ${escapeHtml((draft.technical_skills || []).join(', '))}</p>`);
  rows.push(`<p><strong>Interest:</strong> ${escapeHtml(draft.interest || '')}</p>`);
  rows.push(`<p><strong>Availability:</strong> ${escapeHtml(draft.availability || '')}</p>`);
  return rows.join('');
}

function submitApplication() {
  if (!validatePage4()) return;
  savePage4();
  const draft = getDraft();
  const resumeInput = document.getElementById('resume');
  let resumeFile = resumeInput ? resumeInput.files[0] : null;
  if (!resumeFile && draft.resume_data) {
    const blob = dataURLtoBlob(draft.resume_data);
    resumeFile = new File([blob], draft.resume_name || 'resume.pdf', { type: blob.type });
  }
  if (!resumeFile) {
    showError('error-terms', 'Resume upload is required on page 1 before submitting.');
    return;
  }
  const formData = new FormData();
  formData.append('application_data', JSON.stringify(draft));
  formData.append('resume', resumeFile);
  const submitButton = document.getElementById('submit-button');
  submitButton.textContent = 'Submitting...';
  submitButton.disabled = true;
  fetch('/submit', {method: 'POST', body: formData})
    .then(res => res.json())
    .then(result => {
      if (result.success) {
        clearDraft();
        window.location.href = `/confirmation/${result.application_id}`;
      } else {
        showError('error-terms', result.message || 'Submission failed.');
        submitButton.textContent = 'Submit Application';
        submitButton.disabled = false;
      }
    })
    .catch(() => {
      showError('error-terms', 'Submission failed. Please try again.');
      submitButton.textContent = 'Submit Application';
      submitButton.disabled = false;
    }).then(() => {
      window.location.href = '/'
    });
}

function saveDraftManually() {
  savePage1();
  savePage2();
  savePage3();
  savePage4();
  alert('Draft saved successfully.');
}

window.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const page = parseInt(body.dataset.page, 10);
  if (page) initPage(page);
  const resumeInput = document.getElementById('resume');
  if (resumeInput) resumeInput.addEventListener('change', () => handleResumeFile(resumeInput));
  const nameInput = document.getElementById('full_name');
  if (nameInput) nameInput.addEventListener('input', () => {
    const count = document.getElementById('name-count');
    if (count) count.textContent = `${nameInput.value.length}/100`;
    validatePage1();
  });
  const softChecks = document.querySelectorAll('input[name="soft_skills"], input[name="technical_skills"], input[name="interest"], input[name="availability"]');
  softChecks.forEach(input => input.addEventListener('change', () => {
    updateSkillsCount();
    validatePage4();
  }));
  const notesInput = document.getElementById('additional_notes');
  if (notesInput) {
    const count = document.getElementById('notes-count');
    notesInput.addEventListener('input', () => {
      if (count) count.textContent = `${notesInput.value.length}/300`;
    });
  }
  const saveBtn = document.getElementById('save-draft');
  if (saveBtn) saveBtn.addEventListener('click', saveDraftManually);
});
