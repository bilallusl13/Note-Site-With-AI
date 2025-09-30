#!/bin/bash

# 🚀 AI-Powered Notion Clone - Quick Demo Setup
# This script sets up demo data for showcasing the application

echo "🎯 Setting up demo environment..."

# Check if we're in the right directory
if [ ! -f "notion/package.json" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

echo "📦 Installing dependencies..."
cd notion
npm install

echo "🗄️ Setting up database..."
npx prisma generate
npx prisma db push

echo "🤖 Starting ML backend..."
cd ../mlproject
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

echo "🌱 Creating demo data..."

# Demo user creation (add to your API)
cat > demo_setup.sql << EOF
-- Demo user
INSERT INTO users (id, email, password, name, role) VALUES 
('demo-user-id', 'demo@example.com', '$2b$10$demohashedpassword', 'Demo User', 'user');

-- Demo notes
INSERT INTO notes (id, header, text, classname, userId, isPublic) VALUES
('note1', 'Welcome to AI Notion Clone', 'This is a demo note showcasing the features of our AI-powered note-taking app.', 'Demo', 'demo-user-id', true),
('note2', 'Machine Learning Integration', 'Our app uses SentenceTransformers for semantic analysis and topic recommendations.', 'Tech', 'demo-user-id', true),
('note3', 'Modern Tech Stack', 'Built with Next.js, React, TypeScript, Prisma, and Django for ML backend.', 'Development', 'demo-user-id', true);
EOF

echo "✨ Demo setup complete!"
echo ""
echo "🚀 To start the application:"
echo "1. Frontend: cd notion && npm run dev"
echo "2. ML Backend: cd mlproject && python manage.py runserver"
echo ""
echo "🌐 Demo credentials:"
echo "Email: demo@example.com"
echo "Password: demo123"
echo ""
echo "🎯 Key features to demo:"
echo "- 📝 Rich text note creation"
echo "- 🤖 AI chat assistant"
echo "- 🧠 ML-powered topic recommendations"
echo "- 🗂️ Note organization and search"
echo "- 📱 Responsive design"
echo "- 🔐 Secure authentication"