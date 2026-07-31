import re
import difflib

def clean_text(text):
    # Remove empty lines and clean up whitespace
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    return lines

def get_similarity(lines1, lines2):
    if not lines1 and not lines2:
        return 1.0
    if not lines1 or not lines2:
        return 0.0
    
    # Use SequenceMatcher to compare the two sets of lines
    str1 = "\n".join(lines1)
    str2 = "\n".join(lines2)
    return difflib.SequenceMatcher(None, str1, str2).ratio()

def parse_ocr_log(file_path):
    if not os.path.exists(file_path):
        return []
        
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Split content by frame markers
    frames = re.split(r'=== (frame_\d+_time_[\d.]+s\.jpg) ===', content)
    
    parsed_frames = []
    
    # The first item will be empty (before the first frame marker)
    for i in range(1, len(frames), 2):
        if i+1 < len(frames):
            filename = frames[i]
            text = frames[i+1].strip()
            
            # Extract timestamp from filename
            match = re.search(r'time_([\d.]+)s', filename)
            time_sec = float(match.group(1)) if match else 0.0
            
            lines = clean_text(text)
            parsed_frames.append({
                'filename': filename,
                'time': time_sec,
                'lines': lines
            })
            
    return parsed_frames

def summarize_timeline(frames, similarity_threshold=0.8):
    if not frames:
        return "No frames found."
        
    timeline = []
    current_group = {
        'start_time': frames[0]['time'],
        'end_time': frames[0]['time'],
        'lines': frames[0]['lines'],
        'all_seen_lines': set(frames[0]['lines'])
    }
    
    for next_frame in frames[1:]:
        sim = get_similarity(current_group['lines'], next_frame['lines'])
        
        if sim >= similarity_threshold:
            # Same screen state, update end time and accumulate lines
            current_group['end_time'] = next_frame['time']
            current_group['all_seen_lines'].update(next_frame['lines'])
        else:
            # Different screen state, save current and start new
            timeline.append(current_group)
            current_group = {
                'start_time': next_frame['time'],
                'end_time': next_frame['time'],
                'lines': next_frame['lines'],
                'all_seen_lines': set(next_frame['lines'])
            }
            
    timeline.append(current_group)
    
    # Format the timeline into a readable report
    report = ""
    for idx, group in enumerate(timeline):
        duration = group['end_time'] - group['start_time']
        report += f"--- State {idx+1} ({group['start_time']:.1f}s to {group['end_time']:.1f}s, Duration: {duration:.1f}s) ---\n"
        
        # We display the lines of the first frame in the group as representing the state,
        # but also any other unique lines seen during this state
        sorted_lines = sorted(list(group['all_seen_lines']), key=lambda x: group['lines'].index(x) if x in group['lines'] else len(x))
        for line in sorted_lines:
            report += f"  * {line}\n"
        report += "\n"
        
    return report

import os
if __name__ == "__main__":
    for name in ['codely', 'nested']:
        frames = parse_ocr_log(f"{name}_ocr.txt")
        summary = summarize_timeline(frames, similarity_threshold=0.75)
        
        output_file = f"{name}_summary.txt"
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(summary)
        print(f"Written summary to {output_file}")
