#!/usr/bin/env python3
"""
Build script for React frontend and prepare for deployment
"""
import os
import sys
import subprocess
import shutil
from pathlib import Path

def run_command(cmd, cwd=None):
    """Run command and handle errors"""
    try:
        result = subprocess.run(cmd, shell=True, cwd=cwd, capture_output=True, text=True)
        if result.returncode != 0:
            print(f"Error running command: {cmd}")
            print(f"Stderr: {result.stderr}")
            return False
        print(f"Success: {cmd}")
        return True
    except Exception as e:
        print(f"Exception running command {cmd}: {e}")
        return False

def main():
    """Main build process"""
    print("🚀 Building React Frontend for Production...")
    
    # Check if we're in the right directory
    if not os.path.exists("react-frontend"):
        print("❌ react-frontend directory not found!")
        print("⚠️ Continuing without React build (using backend only)")
        return
    
    # Install dependencies
    print("📦 Installing dependencies...")
    if not run_command("npm install", cwd="react-frontend"):
        sys.exit(1)
    
    # Build React app
    print("🔨 Building React app...")
    if not run_command("npm run build", cwd="react-frontend"):
        sys.exit(1)
    
    # Copy build to static directory
    print("📁 Copying build files...")
    build_dir = Path("react-frontend/build")
    static_dir = Path("static")
    
    if static_dir.exists():
        shutil.rmtree(static_dir)
    
    if build_dir.exists():
        shutil.copytree(build_dir, static_dir)
        print("✅ Build files copied to static/")
    else:
        print("❌ Build directory not found!")
        sys.exit(1)
    
    print("🎉 Build completed successfully!")
    print("🌐 Ready for deployment!")

if __name__ == "__main__":
    main()