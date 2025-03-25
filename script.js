let bluetoothDevice;
let dataCharacteristic;

document.getElementById("connectBtn").addEventListener("click", async () => {
    try {
        bluetoothDevice = await navigator.bluetooth.requestDevice({
            acceptAllDevices: true,
            optionalServices: ["00001101-0000-1000-8000-00805f9b34fb"] // HC-05 UUID
        });

        const server = await bluetoothDevice.gatt.connect();
        const service = await server.getPrimaryService("00001101-0000-1000-8000-00805f9b34fb");
        dataCharacteristic = await service.getCharacteristic("00001101-0000-1000-8000-00805f9b34fb");

        alert("Bluetooth Connected!");

        readSensorData();
    } catch (error) {
        alert("Connection Failed: " + error);
    }
});

document.querySelectorAll(".control-btn").forEach(button => {
    button.addEventListener("click", () => {
        sendCommand(button.dataset.command);
    });
});

document.getElementById("senseSoilBtn").addEventListener("click", () => {
    sendCommand("SENSE");
});

function sendCommand(command) {
    if (dataCharacteristic) {
        const encoder = new TextEncoder();
        dataCharacteristic.writeValue(encoder.encode(command));
    } else {
        alert("Bluetooth not connected!");
    }
}

async function readSensorData() {
    if (dataCharacteristic) {
        try {
            const value = await dataCharacteristic.readValue();
            const decoder = new TextDecoder();
            const sensorData = decoder.decode(value).trim().split(",");

            document.getElementById("moisture").innerText = sensorData[0] + "%";
            document.getElementById("temperature").innerText = sensorData[1] + "°C";
            document.getElementById("humidity").innerText = sensorData[2] + "%";
        } catch (error) {
            console.error("Read error:", error);
        }
    }
}
