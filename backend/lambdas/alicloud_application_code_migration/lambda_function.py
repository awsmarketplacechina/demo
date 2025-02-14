"""
Lambda function for migrating Aliyun SDK code to AWS SDK code.
"""
import os
import json
import time
import boto3
from github import Github
from .sdk_mappings import OSS_TO_S3_MAPPINGS

def lambda_handler(event, context):
    """
    Lambda handler that processes Github repository and migrates Aliyun SDK code to AWS SDK.
    
    Input event format:
    {
        "github_link": "https://github.com/org/repo",
        "branch": "branch_name",
        "token": "github_token"
    }
    """
    try:
        # Extract and validate inputs
        github_link = event.get('github_link')
        branch = event.get('branch')
        token = event.get('token')
        
        if not all([github_link, branch, token]):
            raise ValueError("Missing required input parameters")
            
        # Initialize Github client
        g = Github(token)
        repo = g.get_repo(github_link.split('github.com/')[-1])
        
        # Create new branch
        timestamp = int(time.time())
        new_branch = f'devin/{timestamp}-sdk-migration'
        base_branch = repo.default_branch
        
        # Get source branch ref
        source_branch = repo.get_branch(branch)
        repo.create_git_ref(f'refs/heads/{new_branch}', source_branch.commit.sha)
        
        # Analyze and convert code
        converted_files = convert_sdk_code(repo, branch)
        
        # Create PR
        pr = repo.create_pull(
            title='Convert Aliyun SDK to AWS SDK',
            body=generate_pr_description(converted_files),
            head=new_branch,
            base=base_branch
        )
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'pr_url': pr.html_url
            })
        }
    except ValueError as ve:
        print(f"Validation error: {str(ve)}")
        return {
            'statusCode': 400,
            'body': json.dumps({
                'error': str(ve)
            })
        }
    except Exception as e:
        print(f"Error processing repository: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({
                'error': str(e)
            })
        }

def convert_sdk_code(repo, branch):
    """
    Analyzes repository content and converts Aliyun SDK calls to AWS SDK calls.
    Returns list of converted files with their changes.
    """
    converted_files = []
    
    try:
        # Get all Java files in the repository
        contents = repo.get_contents("", ref=branch)
        while contents:
            content_file = contents.pop(0)
            if content_file.type == "dir":
                contents.extend(repo.get_contents(content_file.path, ref=branch))
            elif content_file.path.endswith(".java"):
                # Process Java files for SDK conversion
                converted = process_java_file(content_file, repo, branch)
                if converted:
                    converted_files.append(converted)
    except Exception as e:
        print(f"Error converting SDK code: {str(e)}")
        raise
        
    return converted_files

def process_java_file(content_file, repo, branch):
    """
    Processes a Java file to convert Aliyun SDK calls to AWS SDK calls.
    Returns conversion details if changes were made.
    """
    content = content_file.decoded_content.decode('utf-8')
    original_content = content
    
    # Look for Aliyun SDK imports and usages
    if 'com.aliyun.oss' in content:
        # Replace imports
        content = content.replace(
            'import com.aliyun.oss.OSS;',
            'import software.amazon.awssdk.services.s3.S3Client;'
        )
        content = content.replace(
            'import com.aliyun.oss.model.*;',
            'import software.amazon.awssdk.services.s3.model.*;'
        )
        
        # Convert SDK method calls using mappings
        for aliyun_method, aws_mapping in OSS_TO_S3_MAPPINGS.items():
            if aliyun_method in content:
                content = convert_method_calls(content, aliyun_method, aws_mapping)
        
        if content != original_content:
            # Update file in repository
            repo.update_file(
                content_file.path,
                f"Convert Aliyun SDK to AWS SDK in {content_file.path}",
                content,
                content_file.sha,
                branch=branch
            )
            return {
                'file': content_file.path,
                'changes': summarize_changes(original_content, content)
            }
    
    return None

def convert_method_calls(content, aliyun_method, aws_mapping):
    """
    Converts Aliyun SDK method calls to AWS SDK equivalents.
    """
    aws_method = aws_mapping['aws_method']
    param_mapping = aws_mapping['param_mapping']
    
    # Replace method calls with AWS equivalents
    # This is a simplified version - in practice, would need more sophisticated parsing
    method_pattern = f"{aliyun_method}\\("
    aws_replacement = f"{aws_method}("
    
    return content.replace(method_pattern, aws_replacement)

def generate_pr_description(converted_files):
    """
    Generates a detailed PR description with the list of changes made.
    """
    description = [
        "# Convert Aliyun SDK to AWS SDK",
        "",
        "This PR converts Aliyun SDK calls to their AWS SDK equivalents.",
        "",
        "## Changes Made",
        ""
    ]
    
    for file_info in converted_files:
        description.append(f"### {file_info['file']}")
        description.append("```diff")
        description.extend(file_info['changes'])
        description.append("```")
        description.append("")
    
    description.append("Link to Devin run: https://app.devin.ai/sessions/b5addb74cd9744279d82ddd1596a9c0c")
    
    return "\n".join(description)

def summarize_changes(original, updated):
    """
    Generates a summary of changes made to a file.
    """
    # Simple diff implementation - in practice, would use a proper diff library
    original_lines = original.splitlines()
    updated_lines = updated.splitlines()
    changes = []
    
    for i, (orig, new) in enumerate(zip(original_lines, updated_lines)):
        if orig != new:
            changes.extend([
                f"- {orig}",
                f"+ {new}"
            ])
    
    return changes
