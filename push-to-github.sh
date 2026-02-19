#!/bin/bash

# GitHub Push Helper Script
# Run this after creating a GitHub repository

echo "=========================================="
echo "  Jarvis Interface - GitHub Push Helper"
echo "=========================================="
echo ""

# Check if remote already exists
if git remote -v > /dev/null 2>&1; then
    echo "✓ Git remote found"
    git remote -v
else
    echo "⚠ No remote found. Please enter your GitHub repo URL:"
    echo "  (e.g., https://github.com/username/jarvis-interface.git)"
    read -p "GitHub URL: " repo_url
    
    git remote add origin "$repo_url"
    echo "✓ Remote added"
fi

echo ""
echo "Pushing to GitHub..."
git branch -M main
git push -u origin main

echo ""
if [ $? -eq 0 ]; then
    echo "✅ Successfully pushed to GitHub!"
    echo ""
    echo "Next steps:"
    echo "1. Go to https://app.netlify.com"
    echo "2. Click 'Add new site' → 'Import an existing project'"
    echo "3. Select this repository"
    echo "4. Deploy!"
else
    echo "❌ Push failed. Check your GitHub credentials."
fi