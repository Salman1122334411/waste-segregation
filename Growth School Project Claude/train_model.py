import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense, Dropout
import os

def create_model():
    model = Sequential([
        # First Convolutional Block
        Conv2D(32, (3, 3), activation='relu', input_shape=(224, 224, 3)),
        MaxPooling2D(2, 2),
        
        # Second Convolutional Block
        Conv2D(64, (3, 3), activation='relu'),
        MaxPooling2D(2, 2),
        
        # Third Convolutional Block
        Conv2D(128, (3, 3), activation='relu'),
        MaxPooling2D(2, 2),
        
        # Fourth Convolutional Block
        Conv2D(128, (3, 3), activation='relu'),
        MaxPooling2D(2, 2),
        
        # Flatten and Dense Layers
        Flatten(),
        Dense(512, activation='relu'),
        Dropout(0.5),
        Dense(4, activation='softmax')  # 4 categories: Recyclable, Organic, Hazardous, General Waste
    ])
    
    model.compile(
        optimizer='adam',
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )
    
    return model

def train_model():
    # Data augmentation for training
    train_datagen = ImageDataGenerator(
        rescale=1./255,
        rotation_range=20,
        width_shift_range=0.2,
        height_shift_range=0.2,
        shear_range=0.2,
        zoom_range=0.2,
        horizontal_flip=True,
        fill_mode='nearest',
        validation_split=0.2
    )

    # Only rescaling for validation
    validation_datagen = ImageDataGenerator(
        rescale=1./255,
        validation_split=0.2
    )

    # Create data generators
    train_generator = train_datagen.flow_from_directory(
        'dataset/train',
        target_size=(224, 224),
        batch_size=32,
        class_mode='categorical',
        subset='training'
    )

    validation_generator = validation_datagen.flow_from_directory(
        'dataset/train',
        target_size=(224, 224),
        batch_size=32,
        class_mode='categorical',
        subset='validation'
    )

    # Create and train the model
    model = create_model()
    
    # Add callbacks
    callbacks = [
        tf.keras.callbacks.EarlyStopping(
            monitor='val_loss',
            patience=5,
            restore_best_weights=True
        ),
        tf.keras.callbacks.ModelCheckpoint(
            'waste_classification_model.h5',
            monitor='val_accuracy',
            save_best_only=True
        )
    ]

    # Train the model
    history = model.fit(
        train_generator,
        steps_per_epoch=train_generator.samples // train_generator.batch_size,
        epochs=50,
        validation_data=validation_generator,
        validation_steps=validation_generator.samples // validation_generator.batch_size,
        callbacks=callbacks
    )

    # Save the final model
    model.save('waste_classification_model.h5')
    print("Model training completed and saved!")

if __name__ == "__main__":
    # Create dataset directory structure if it doesn't exist
    dataset_structure = {
        'dataset/train/recyclable': [],
        'dataset/train/organic': [],
        'dataset/train/hazardous': [],
        'dataset/train/general': []
    }
    
    for directory in dataset_structure.keys():
        os.makedirs(directory, exist_ok=True)
    
    print("Dataset directories created. Please add your training images to the appropriate folders:")
    print("- dataset/train/recyclable")
    print("- dataset/train/organic")
    print("- dataset/train/hazardous")
    print("- dataset/train/general")
    
    # Uncomment the following line to start training after adding images
    # train_model() 