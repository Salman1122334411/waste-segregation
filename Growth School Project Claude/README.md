# AI-Based Smart Waste Segregation Advisor

This project implements a web-based waste classification system that uses AI to identify and categorize different types of waste items. The system provides users with proper disposal instructions based on the classification results.

## Features

- Image upload with drag-and-drop support
- Real-time waste classification using AI
- Detailed disposal instructions
- Educational information about waste categories
- Responsive web interface

## Setup Instructions

### 1. Install Python Dependencies

```bash
pip install -r requirements.txt
```

### 2. Prepare the Dataset

1. Create the following directory structure:
```
dataset/
└── train/
    ├── recyclable/
    ├── organic/
    ├── hazardous/
    └── general/
```

2. Add training images to their respective category folders:
- `dataset/train/recyclable/`: Images of recyclable items
- `dataset/train/organic/`: Images of organic waste
- `dataset/train/hazardous/`: Images of hazardous materials
- `dataset/train/general/`: Images of general waste

### 3. Train the Model

1. Open `train_model.py`
2. Uncomment the `train_model()` line at the bottom of the file
3. Run the training script:
```bash
python train_model.py
```

The trained model will be saved as `waste_classification_model.h5`

### 4. Start the Backend Server

```bash
python app.py
```

The server will start on `http://localhost:5000`

### 5. Open the Frontend

Open `index.html` in your web browser to use the application.

## Usage

1. Click the upload area or drag and drop an image of a waste item
2. Wait for the AI to analyze the image
3. View the classification results and disposal instructions
4. Follow the provided instructions for proper waste disposal

## Technical Details

- Frontend: HTML, CSS, JavaScript
- Backend: Python with Flask
- AI Model: TensorFlow/Keras CNN
- Image Processing: PIL/Pillow

## Model Architecture

The model uses a Convolutional Neural Network (CNN) with:
- 4 convolutional blocks
- MaxPooling layers
- Dropout for regularization
- Dense layers for classification
- Softmax activation for multi-class classification

## Contributing

Feel free to submit issues and enhancement requests! 