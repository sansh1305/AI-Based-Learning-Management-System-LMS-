import bcrypt from "bcryptjs";

async function createuser(username, password, role) {
  const hashedPassword = await bcrypt.hash(password, 10);
  console.log({
    username,
    passwordHash: hashedPassword,
    role,
    createdAt: new Date(),
  });
}

createuser("adminuser", "Pass1234", "admin");
createuser("teacheruser", "Pass1234", "teacher");
createuser("studentuser", "Pass1234", "student");
