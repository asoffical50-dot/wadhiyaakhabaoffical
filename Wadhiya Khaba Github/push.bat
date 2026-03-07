@echo off
echo Syncing Wadhiya Khaba to GitHub...
git add .
git commit -m "Update from push.bat"
git push origin main
echo Done! Your website is being updated.
pause
