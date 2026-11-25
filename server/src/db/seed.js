require('dotenv').config();
const pool = require('./pool');

const data = {
  'Computer Science': ['Algorithms', 'Data Structures', 'Operating Systems', 'Database Systems', 'Computer Networks', 'Software Engineering', 'Artificial Intelligence', 'Machine Learning', 'Cybersecurity', 'Web Development'],
  'Mathematics': ['Calculus', 'Linear Algebra', 'Discrete Mathematics', 'Probability', 'Statistics', 'Differential Equations', 'Number Theory', 'Numerical Methods', 'Geometry', 'Mathematical Logic'],
  'Physics': ['Classical Mechanics', 'Thermodynamics', 'Electromagnetism', 'Quantum Physics', 'Optics', 'Nuclear Physics', 'Astrophysics', 'Fluid Dynamics', 'Solid State Physics', 'Relativity'],
  'Business': ['Marketing', 'Accounting', 'Finance', 'Human Resource Management', 'Entrepreneurship', 'Operations Management', 'Business Law', 'Economics', 'Supply Chain Management', 'Organizational Behavior'],
  'Engineering': ['Circuit Analysis', 'Digital Electronics', 'Control Systems', 'Signal Processing', 'Engineering Mechanics', 'Heat Transfer', 'Power Systems', 'Materials Science', 'Robotics', 'Environmental Engineering'],
  'Literature': ['English Poetry', 'Bengali Literature', 'Modern Fiction', 'Drama', 'Literary Criticism', 'Creative Writing', 'World Literature', 'Linguistics', 'Translation Studies', 'Rhetoric'],
  'Life Sciences': ['Biology', 'Genetics', 'Microbiology', 'Biochemistry', 'Ecology', 'Anatomy', 'Physiology', 'Botany', 'Zoology', 'Biotechnology'],
  'Social Sciences': ['Sociology', 'Psychology', 'Political Science', 'Anthropology', 'International Relations', 'Public Policy', 'Criminology', 'Geography', 'Development Studies', 'Philosophy'],
  'History': ['Ancient History', 'Medieval History', 'Modern History', 'History of Bangladesh', 'Islamic History', 'World Wars', 'Colonial History', 'Art History', 'Archaeology', 'History of Science'],
  'Education': ['Teaching Methods', 'Curriculum Design', 'Educational Psychology', 'Assessment', 'Classroom Management', 'Special Education', 'E-Learning', 'Educational Technology', 'Academic Writing', 'Research Methods'],
};

const patterns = [
  (t) => `Introduction to ${t}`,
  (t) => `Fundamentals of ${t}`,
  (t) => `Principles of ${t}`,
  (t) => `Advanced ${t}`,
  (t) => `Applied ${t}`,
  (t) => `Modern ${t}`,
  (t) => `${t}: Theory and Practice`,
  (t) => `Essentials of ${t}`,
  (t) => `A Handbook of ${t}`,
  (t) => `${t} for Beginners`,
];

const firstNames = ['Rahim', 'Karim', 'Nusrat', 'Farhana', 'Tanvir', 'Sabrina', 'Imran', 'Mehzabin', 'Arif', 'Sadia', 'John', 'Emily', 'David', 'Sarah', 'Michael', 'Anna', 'Robert', 'Laura', 'James', 'Priya'];
const lastNames = ['Hossain', 'Ahmed', 'Chowdhury', 'Islam', 'Rahman', 'Khan', 'Akter', 'Uddin', 'Sarker', 'Das', 'Smith', 'Johnson', 'Brown', 'Taylor', 'Wilson', 'Clark', 'Lewis', 'Walker', 'Hall', 'Young', 'Patel', 'Sharma', 'Roy', 'Sen', 'Bose'];

async function seed() {
  const existing = await pool.query('SELECT COUNT(*) FROM books');
  if (Number(existing.rows[0].count) > 0) {
    console.log('Books already exist. Skipping seed.');
    await pool.end();
    return;
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    let n = 0;

    for (const [category, topics] of Object.entries(data)) {
      for (const topic of topics) {
        for (const pattern of patterns) {
          n++;
          const title = pattern(topic);
          const author = `${firstNames[n % firstNames.length]} ${lastNames[(n * 7) % lastNames.length]}`;
          const isbn = '978' + String(n).padStart(10, '0');
          const hasDigital = n % 10 < 6; // about 60% digital
          const price = 300 + (n * 37) % 2200; // 300 to 2499 taka

          const result = await client.query(
            `INSERT INTO books (title, author, category, isbn, has_digital, price)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
            [title, author, category, isbn, hasDigital, price]
          );

          await client.query(
            `INSERT INTO book_copies (book_id, copy_number)
             SELECT $1, generate_series(1, 3)`,
            [result.rows[0].id]
          );
        }
      }
    }

    await client.query('COMMIT');
    console.log(`Done: ${n} books and ${n * 3} copies added.`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Seed failed:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();