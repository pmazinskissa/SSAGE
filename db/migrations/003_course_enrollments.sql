-- Course enrollments: restrict course access per user (keyed by email for pre-enroll persistence)
CREATE TABLE course_enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL,
    course_slug VARCHAR(100) NOT NULL,
    enrolled_at TIMESTAMP NOT NULL DEFAULT NOW(),
    enrolled_by UUID REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE(email, course_slug)
);

CREATE INDEX idx_course_enrollments_email ON course_enrollments(email);
CREATE INDEX idx_course_enrollments_course ON course_enrollments(course_slug);
