import os
import cv2

def extract_frames(video_path, output_dir, interval_sec=1.0):
    if not os.path.exists(video_path):
        print(f"Error: Video file {video_path} not found.")
        return
    
    os.makedirs(output_dir, exist_ok=True)
    
    cap = cv2.VideoCapture(video_path)
    fps = cap.get(cv2.CAP_PROP_FPS)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    duration = total_frames / fps if fps > 0 else 0
    
    print(f"Analyzing {video_path}:")
    print(f"  FPS: {fps}")
    print(f"  Total Frames: {total_frames}")
    print(f"  Duration: {duration:.2f} seconds")
    
    frame_interval = int(fps * interval_sec) if fps > 0 else 30
    
    count = 0
    saved_count = 0
    
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
            
        if count % frame_interval == 0:
            time_sec = count / fps if fps > 0 else 0
            filename = os.path.join(output_dir, f"frame_{saved_count:03d}_time_{time_sec:.1f}s.jpg")
            cv2.imwrite(filename, frame)
            saved_count += 1
            
        count += 1
        
    cap.release()
    print(f"  Saved {saved_count} frames to {output_dir}\n")

if __name__ == "__main__":
    extract_frames("Codely Problem.mp4", "frames/codely", interval_sec=1.0)
    extract_frames("Nested navigation issue.mp4", "frames/nested", interval_sec=1.0)
