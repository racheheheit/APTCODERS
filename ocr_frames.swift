import Foundation
import Vision
import AppKit

func performOCR(on imagePath: String) -> String {
    guard let image = NSImage(contentsOfFile: imagePath) else {
        return "Error: Could not load image"
    }
    
    guard let tiffData = image.tiffRepresentation,
          let bitmap = NSBitmapImageRep(data: tiffData),
          let cgImage = bitmap.cgImage else {
        return "Error: Could not convert image to CGImage"
    }
    
    var resultText = ""
    let semaphore = DispatchSemaphore(value: 0)
    
    let request = VNRecognizeTextRequest { (request, error) in
        defer { semaphore.signal() }
        if let error = error {
            resultText = "OCR Error: \(error.localizedDescription)"
            return
        }
        
        guard let observations = request.results as? [VNRecognizedTextObservation] else {
            return
        }
        
        var lines = [String]()
        for observation in observations {
            if let topCandidate = observation.topCandidates(1).first {
                lines.append(topCandidate.string)
            }
        }
        resultText = lines.joined(separator: "\n")
    }
    
    request.recognitionLevel = .accurate
    request.usesLanguageCorrection = true
    
    let handler = VNImageRequestHandler(cgImage: cgImage, options: [:])
    do {
        try handler.perform([request])
        semaphore.wait()
    } catch {
        resultText = "Handler Error: \(error.localizedDescription)"
    }
    
    return resultText
}

func scanDirectory(path: String, outputLog: String) {
    let fm = FileManager.default
    guard let files = try? fm.contentsOfDirectory(atPath: path) else {
        print("Could not read directory \(path)")
        return
    }
    
    let sortedFiles = files.filter { $0.hasSuffix(".jpg") }.sorted()
    var output = ""
    
    print("OCRing \(sortedFiles.count) files in \(path)...")
    for file in sortedFiles {
        let fullPath = (path as NSString).appendingPathComponent(file)
        let text = performOCR(on: fullPath)
        let logEntry = "=== \(file) ===\n\(text)\n\n"
        output += logEntry
    }
    
    do {
        try output.write(toFile: outputLog, atomically: true, encoding: .utf8)
        print("Saved OCR results to \(outputLog)")
    } catch {
        print("Failed to write to \(outputLog)")
    }
}

let args = CommandLine.arguments
if args.count < 3 {
    print("Usage: ocr_frames <dir_path> <output_log_path>")
    exit(1)
}

scanDirectory(path: args[1], outputLog: args[2])
