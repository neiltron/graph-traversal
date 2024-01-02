# Step 1: Extract IDs from output_file.txt
def extract_ids(file_path):
    ids = set()
    with open(file_path, 'r') as file:
        for line in file:
            parts = line.split(',')
            if parts:  # Check if the line is not empty
                ids.add(parts[0].strip())  # Add the first column (ID) to the set
    return ids

# Step 2: Filter edges from the edges file
def filter_edges(ids, edges_file_path, output_file_path):
    with open(edges_file_path, 'r') as edges_file, open(output_file_path, 'w') as output_file:
        for line in edges_file:
            parts = line.strip().split()
            # print(parts)
            if len(parts) == 2 and parts[0] in ids and parts[1] in ids:
                output_file.write(line)

# Usage
output_file_path = './enwiki-2013-names-trimmed.csv'  # Path to your output file from previous task
edges_file_path = './enwiki-2013.txt'  # Path to the edges file
filtered_edges_file_path = './enwiki-2013-trimmed.txt'  # Path for the new filtered edges file

ids = extract_ids(output_file_path)
print(ids)
filter_edges(ids, edges_file_path, filtered_edges_file_path)
