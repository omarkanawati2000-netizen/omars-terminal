"""Create GitHub repo and push via GitHub API using a token, or prompt for one."""
import subprocess, json, sys, os, base64, requests

# Try to get token from git credential manager
def get_token():
    # Check env
    for k in ['GITHUB_TOKEN', 'GH_TOKEN']:
        if os.environ.get(k):
            return os.environ[k]
    return None

def create_repo_and_push(token):
    headers = {'Authorization': f'token {token}', 'Accept': 'application/vnd.github.v3+json'}
    
    # Create repo
    r = requests.post('https://api.github.com/user/repos', headers=headers, json={
        'name': 'omar-terminal',
        'description': 'Bloomberg-style live crypto trading terminal powered by Hyperliquid API',
        'public': True,
        'auto_init': False
    })
    
    if r.status_code == 201:
        repo = r.json()
        print(f"✅ Created: {repo['html_url']}")
    elif r.status_code == 422 and 'already exists' in r.text:
        print("Repo already exists, pushing to it...")
        # Get username
        u = requests.get('https://api.github.com/user', headers=headers).json()
        repo = {'html_url': f"https://github.com/{u['login']}/omar-terminal", 'clone_url': f"https://github.com/{u['login']}/omar-terminal.git"}
    else:
        print(f"❌ Error: {r.status_code} {r.text}")
        return
    
    # Get username for remote URL
    u = requests.get('https://api.github.com/user', headers=headers).json()
    username = u['login']
    remote_url = f"https://{username}:{token}@github.com/{username}/omar-terminal.git"
    
    # Set remote and push
    subprocess.run(['git', 'remote', 'remove', 'origin'], capture_output=True)
    subprocess.run(['git', 'remote', 'add', 'origin', remote_url], capture_output=True)
    result = subprocess.run(['git', 'push', '-u', 'origin', 'master'], capture_output=True, text=True)
    
    if result.returncode == 0:
        print(f"✅ Pushed! https://github.com/{username}/omar-terminal")
    else:
        # Try main branch
        result2 = subprocess.run(['git', 'push', '-u', 'origin', 'master:main'], capture_output=True, text=True)
        if result2.returncode == 0:
            print(f"✅ Pushed! https://github.com/{username}/omar-terminal")
        else:
            print(f"Push error: {result.stderr} {result2.stderr}")
    
    # Clean token from remote URL
    clean_url = f"https://github.com/{username}/omar-terminal.git"
    subprocess.run(['git', 'remote', 'set-url', 'origin', clean_url], capture_output=True)

if __name__ == '__main__':
    token = get_token()
    if not token and len(sys.argv) > 1:
        token = sys.argv[1]
    if not token:
        token = input("Enter GitHub personal access token: ").strip()
    if token:
        create_repo_and_push(token)
    else:
        print("No token provided")
