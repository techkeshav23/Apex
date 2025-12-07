# Mobile App Setup

## Prerequisites
1.  **Backend Server**: Ensure the backend server is running.
    *   Navigate to the `backend` folder.
    *   Run `python app.py`.
    *   The server defaults to port 5000.

## Running the App (Development)

1.  **Install Dependencies**:
    ```bash
    cd Mobile_mode
    npm install
    ```

2.  **Start the App**:
    ```bash
    npx expo start
    ```

3.  **Connect to Backend**:
    *   **Android Emulator**: The app is pre-configured to use `http://10.0.2.2:5000`, which maps to `localhost:5000` on your computer.
    *   **Physical Device**:
        1.  Find your computer's local IP address (e.g., `192.168.1.5`).
        2.  Open `App.js`.
        3.  Update `const API_URL = 'http://10.0.2.2:5000';` to `const API_URL = 'http://YOUR_IP_ADDRESS:5000';`.
        4.  Scan the QR code shown in the terminal with the **Expo Go** app on your phone.

## Building the Native App (APK/IPA)

To generate an APK file for Android:

1.  **Install EAS CLI**:
    ```bash
    npm install -g eas-cli
    ```

2.  **Login to Expo**:
    ```bash
    eas login
    ```

3.  **Configure Build**:
    ```bash
    eas build:configure
    ```

4.  **Build for Android**:
    ```bash
    eas build -p android --profile preview
    ```
    *   This will generate an APK that you can download and install on your device.
