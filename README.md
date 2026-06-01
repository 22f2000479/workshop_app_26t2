# workshop_intern_app
## Positive Test Cases

### 1. Complete Internship Application Submission

**Steps:**
- Entered valid personal details (name, email, phone, university, degree, graduation date).
- Uploaded a valid resume.
- Added at least two academic courses with valid grades.
- Added work experience with valid details.
- Selected technical skills, soft skills, internship interest, and availability.
- Submitted the application.

**Result:**
- Application was submitted successfully.
- No validation errors are shown.
- Confirmation of successful submission was displayed.

---

### 2. Application Without Work Experience

**Steps:**
- Entered valid personal details and uploaded a resume.
- Added multiple academic courses with valid data.
- Skipped the work experience section completely.
- Selected technical skills, soft skills, internship interest, and availability.
- Submitted the application.

**Result:**
- Application was submitted successfully even without work experience.
- Work experience section was treated as optional.
- No validation errors appeared.

---

### 3. Multiple Skill and Interest Selection Validation

**Steps:**
- Entered valid personal information and uploaded a resume.
- Added at least two academic courses.
- Skipped work experience.
- Selected multiple technical skills (Python, Java, SQL, Git, AWS).
- Selected multiple soft skills (Communication, Teamwork, Problem Solving).
- Chose internship interest (Machine Learning / Data Science).
- Selected availability and submit application.

**Result:**
- Multiple skill selections were accepted correctly.
- No UI or validation issues occurred.
- Application was submitted successfully.