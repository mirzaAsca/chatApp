import os
from pathlib import Path

root_dir = '.'  # replace this with your directory path
out_file = 'output.txt'  # replace with your output file path
extensions = ['.js', '.handlebars']  # file extensions to collect content from

def print_tree(directory, file_output, indent=''):
    if 'node_modules' in directory or 'package-lock.json' in directory or '.git' in directory:  # ignore node_modules, package-lock.json and .git
        return
    contents = sorted(os.listdir(directory))
    pointers = ['├── ' if item != contents[-1] else '└── ' for item in contents]
    for pointer, path in zip(pointers, contents):
        full_path = os.path.join(directory, path)
        print(indent + pointer + path, file=file_output)
        if os.path.isdir(full_path):
            next_indent = '│   ' if pointer.startswith('├') else '    '
            print_tree(full_path, file_output, indent=indent + next_indent)

def print_file_contents(directory, file_output, indent=''):
    if 'node_modules' in directory or 'package-lock.json' in directory or '.git' in directory:  # ignore node_modules, package-lock.json and .git
        return
    contents = sorted(os.listdir(directory))
    for path in contents:
        full_path = os.path.join(directory, path)
        if os.path.isfile(full_path) and Path(full_path).suffix in extensions:
            print("\n==============================\n", file=file_output)
            print('-' + Path(full_path).name, file=file_output)
            with open(full_path, 'r') as content_file:
                print(content_file.read(), file=file_output)
        elif os.path.isdir(full_path):
            print_file_contents(full_path, file_output, indent=indent + '    ')

with open(out_file, 'w', encoding='utf-8') as f:  # specify utf-8 encoding
    print_tree(root_dir, f)
    print_file_contents(root_dir, f)
