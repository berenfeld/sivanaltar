#!/bin/bash

# Create images directory if it doesn't exist
mkdir -p images

# Function to download an image if it doesn't already exist
download_image() {
    local url=$1
    local filename=$2

    if [ ! -f "images/$filename" ]; then
        echo "Downloading $filename from $url..."
        curl -s "$url" -o "images/$filename"
        echo "✓ Downloaded: images/$filename"
    else
        echo "⤾ Skipping: images/$filename (already exists)"
    fi
}

echo "Starting image download from Strikingly..."

# Logo images
download_image "https://custom-images.strikinglycdn.com/res/hrscywv4p/image/upload/f_auto,q_auto/20660800/ai_logo_1747226258_zNcwzgdark_ai_logo.png" "logo.png"
download_image "https://custom-images.strikinglycdn.com/res/hrscywv4p/image/upload/f_auto,q_auto/20660800/ai_logo_1747226258_hczzrklight_ai_logo.png" "logo-light.png"
download_image "https://custom-images.strikinglycdn.com/res/hrscywv4p/image/upload/f_auto,q_auto/20660800/ai_logo_1747226258_nE3osrfavicon_ai_logo.png" "favicon.png"

# Hero background image
download_image "https://custom-images.strikinglycdn.com/res/hrscywv4p/image/upload/c_limit,fl_lossy,h_1500,w_2000,f_auto,q_auto/20660800/768541_939918.jpeg" "hero-background.jpeg"

# Contact page background
download_image "https://custom-images.strikinglycdn.com/res/hrscywv4p/image/upload/c_limit,fl_lossy,h_1500,w_2000,f_auto,q_auto/20660800/29477_711320.jpeg" "contact-background.jpeg"

# Blog post image
download_image "https://custom-images.strikinglycdn.com/res/hrscywv4p/image/upload/c_limit,fl_lossy,h_1500,w_2000,f_auto,q_auto/20660800/417364_238288.jpeg" "blog-post-image.jpeg"

# Gallery images
download_image "https://custom-images.strikinglycdn.com/res/hrscywv4p/image/upload/c_limit,fl_lossy,h_9000,w_1200,f_auto,q_auto/20660800/356660_562810.jpeg" "gallery-1.jpeg"
download_image "https://custom-images.strikinglycdn.com/res/hrscywv4p/image/upload/c_limit,fl_lossy,h_9000,w_1200,f_auto,q_auto/20660800/944945_173168.jpeg" "gallery-2.jpeg"
download_image "https://custom-images.strikinglycdn.com/res/hrscywv4p/image/upload/c_limit,fl_lossy,h_9000,w_1200,f_auto,q_auto/20660800/456806_550023.jpeg" "gallery-3.jpeg"
download_image "https://custom-images.strikinglycdn.com/res/hrscywv4p/image/upload/c_limit,fl_lossy,h_9000,w_1200,f_auto,q_auto/20660800/438806_308265.jpeg" "gallery-4.jpeg"
download_image "https://custom-images.strikinglycdn.com/res/hrscywv4p/image/upload/c_limit,fl_lossy,h_9000,w_1200,f_auto,q_auto/20660800/391053_554989.jpeg" "gallery-5.jpeg"
download_image "https://custom-images.strikinglycdn.com/res/hrscywv4p/image/upload/c_limit,fl_lossy,h_9000,w_1200,f_auto,q_auto/20660800/474899_272651.jpeg" "gallery-6.jpeg"
download_image "https://custom-images.strikinglycdn.com/res/hrscywv4p/image/upload/c_limit,fl_lossy,h_9000,w_1200,f_auto,q_auto/20660800/400936_798683.jpeg" "gallery-7.jpeg"
download_image "https://custom-images.strikinglycdn.com/res/hrscywv4p/image/upload/c_limit,fl_lossy,h_9000,w_1200,f_auto,q_auto/20660800/474794_711473.jpeg" "gallery-8.jpeg"
download_image "https://custom-images.strikinglycdn.com/res/hrscywv4p/image/upload/c_limit,fl_lossy,h_9000,w_1200,f_auto,q_auto/20660800/962638_294640.jpeg" "gallery-9.jpeg"
download_image "https://custom-images.strikinglycdn.com/res/hrscywv4p/image/upload/c_limit,fl_lossy,h_9000,w_1200,f_auto,q_auto/20660800/636905_952157.jpeg" "gallery-10.jpeg"

# Main page images
download_image "https://custom-images.strikinglycdn.com/res/hrscywv4p/image/upload/c_limit,fl_lossy,h_9000,w_1200,f_auto,q_auto/20660800/839166_196712.jpeg" "main-1.jpeg"
download_image "https://custom-images.strikinglycdn.com/res/hrscywv4p/image/upload/c_limit,fl_lossy,h_9000,w_1200,f_auto,q_auto/20660800/516350_347172.png" "main-2.png"
download_image "https://custom-images.strikinglycdn.com/res/hrscywv4p/image/upload/c_limit,fl_lossy,h_9000,w_1200,f_auto,q_auto/20660800/70493_534363.jpeg" "main-3.jpeg"

echo "Download complete. All images saved to the images/ directory."
