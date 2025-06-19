-- Create attendance table
CREATE TABLE IF NOT EXISTS attendance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  time VARCHAR(50) NOT NULL,
  date VARCHAR(50) NOT NULL,
  location TEXT,
  status VARCHAR(10) CHECK (status IN ('masuk', 'keluar')) NOT NULL,
  face_image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
CREATE INDEX IF NOT EXISTS idx_attendance_name ON attendance(name);
CREATE INDEX IF NOT EXISTS idx_attendance_created_at ON attendance(created_at);
