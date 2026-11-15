import AppKit
import Foundation

let root = URL(fileURLWithPath: CommandLine.arguments[1], isDirectory: true)
let source = NSImage(contentsOf: root.appendingPathComponent("original-20261115.jpg"))!
let photograph = NSBitmapImageRep(data: try! Data(contentsOf: root.appendingPathComponent("original-20261115.jpg")))!

let wordmark = NSBitmapImageRep(bitmapDataPlanes: nil, pixelsWide: 750, pixelsHigh: 78,
    bitsPerSample: 8, samplesPerPixel: 4, hasAlpha: true, isPlanar: false,
    colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0)!
for y in 0..<78 {
    for x in 0..<750 {
        let pixel = photograph.colorAt(x: x + 265, y: y + 360)!.usingColorSpace(.deviceRGB)!
        let brightness = 0.2126 * pixel.redComponent + 0.7152 * pixel.greenComponent + 0.0722 * pixel.blueComponent
        let alpha = max(0, min(1, (brightness - 0.06) / 0.88))
        wordmark.setColor(NSColor(deviceRed: 0, green: 0, blue: 0, alpha: alpha), atX: x, y: y)
    }
}
try! wordmark.representation(using: .png, properties: [:])!.write(to: root.appendingPathComponent("wordmark.png"))

func render(_ name: String, width: Int, height: Int, markRect: NSRect) {
    let bitmap = NSBitmapImageRep(bitmapDataPlanes: nil, pixelsWide: width, pixelsHigh: height,
        bitsPerSample: 8, samplesPerPixel: 4, hasAlpha: true, isPlanar: false,
        colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0)!
    NSGraphicsContext.saveGraphicsState()
    NSGraphicsContext.current = NSGraphicsContext(bitmapImageRep: bitmap)
    NSColor.white.setFill()
    NSRect(x: 0, y: 0, width: width, height: height).fill()
    source.draw(in: markRect, from: NSRect(x: 265, y: 265, width: 750, height: 750),
        operation: .copy, fraction: 1.0, respectFlipped: false, hints: [.interpolation: NSImageInterpolation.high])
    NSGraphicsContext.restoreGraphicsState()
    try! bitmap.representation(using: .png, properties: [:])!.write(to: root.appendingPathComponent(name))
}

let icon = NSBitmapImageRep(bitmapDataPlanes: nil, pixelsWide: 180, pixelsHigh: 180,
    bitsPerSample: 8, samplesPerPixel: 4, hasAlpha: true, isPlanar: false,
    colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0)!
NSGraphicsContext.saveGraphicsState()
NSGraphicsContext.current = NSGraphicsContext(bitmapImageRep: icon)
NSColor.white.setFill()
NSRect(x: 0, y: 0, width: 180, height: 180).fill()
NSColor.black.setFill()
NSRect(x: 8, y: 19, width: 164, height: 142).fill()
NSColor.white.setFill()
for left in [44.0, 107.3] {
    let arch = NSBezierPath()
    arch.move(to: NSPoint(x: left, y: 19))
    arch.line(to: NSPoint(x: left, y: 106.5))
    arch.appendArc(withCenter: NSPoint(x: left + 14.5, y: 106.5), radius: 14.5,
        startAngle: 180, endAngle: 0, clockwise: true)
    arch.line(to: NSPoint(x: left + 29, y: 19))
    arch.close()
    arch.fill()
}
NSGraphicsContext.restoreGraphicsState()
try! icon.representation(using: .png, properties: [:])!.write(to: root.appendingPathComponent("apple-touch-icon.png"))
render("share.png", width: 1200, height: 630,
    markRect: NSRect(x: 325, y: 40, width: 550, height: 550))
render("logo.png", width: 750, height: 750,
    markRect: NSRect(x: 0, y: 0, width: 750, height: 750))
