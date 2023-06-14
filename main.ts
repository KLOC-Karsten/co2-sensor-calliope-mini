// 
// 
//  References:
//  - https://github.com/calliope-mini/pxt-SCD30
//  - https://sensirion.com/media/documents/D7CEEF4A/6165372F/Sensirion_CO2_Sensors_SCD30_Interface_Description.pdf
// 
let co2 = 0
let temperature = 0
let humidity = 0
function sensor_initialisieren() {
    //  Command "Trigger continuous measurement"
    let commandBuffer = pins.createBuffer(5)
    commandBuffer[0] = 0x00
    commandBuffer[1] = 0x10
    //  No pressure compensation
    commandBuffer[2] = 0x00
    commandBuffer[3] = 0x00
    //  CRC
    commandBuffer[4] = 0x81
    pins.i2cWriteBuffer(0x61, commandBuffer, false)
}

function sensor_is_bereit() {
    //  Command "Get data ready status"
    pins.i2cWriteNumber(0x61, 0x0202, NumberFormat.UInt16BE, false)
    let buf = pins.createBuffer(3)
    buf = pins.i2cReadBuffer(0x61, 3, false)
    return buf[1] == 1
}

function sensor_messung() {
    
    while (sensor_is_bereit() == false) {
        basic.pause(10)
    }
    let buf = pins.createBuffer(18)
    let tbuf = pins.createBuffer(4)
    pins.i2cWriteNumber(0x61, 0x0300, NumberFormat.UInt16BE, false)
    basic.pause(10)
    buf = pins.i2cReadBuffer(0x61, 18, false)
    //  CO2
    tbuf.setNumber(NumberFormat.Int8LE, 0, buf.getNumber(NumberFormat.UInt8LE, 0))
    tbuf.setNumber(NumberFormat.Int8LE, 1, buf.getNumber(NumberFormat.UInt8LE, 1))
    tbuf.setNumber(NumberFormat.Int8LE, 3, buf.getNumber(NumberFormat.UInt8LE, 3))
    tbuf.setNumber(NumberFormat.Int8LE, 4, buf.getNumber(NumberFormat.UInt8LE, 4))
    co2 = tbuf.getNumber(NumberFormat.Float32BE, 0)
    co2 = Math.round(co2 * 100) / 100
    //  temperature
    tbuf.setNumber(NumberFormat.Int8LE, 0, buf.getNumber(NumberFormat.UInt8LE, 6))
    tbuf.setNumber(NumberFormat.Int8LE, 1, buf.getNumber(NumberFormat.UInt8LE, 7))
    tbuf.setNumber(NumberFormat.Int8LE, 3, buf.getNumber(NumberFormat.UInt8LE, 9))
    tbuf.setNumber(NumberFormat.Int8LE, 4, buf.getNumber(NumberFormat.UInt8LE, 10))
    temperature = tbuf.getNumber(NumberFormat.Float32BE, 0)
    temperature = Math.round(temperature * 100) / 100
    //  humidity
    tbuf.setNumber(NumberFormat.Int8LE, 0, buf.getNumber(NumberFormat.UInt8LE, 12))
    tbuf.setNumber(NumberFormat.Int8LE, 1, buf.getNumber(NumberFormat.UInt8LE, 13))
    tbuf.setNumber(NumberFormat.Int8LE, 3, buf.getNumber(NumberFormat.UInt8LE, 15))
    tbuf.setNumber(NumberFormat.Int8LE, 4, buf.getNumber(NumberFormat.UInt8LE, 16))
    humidity = tbuf.getNumber(NumberFormat.Float32BE, 0)
    humidity = Math.round(humidity * 100) / 100
}

sensor_initialisieren()
basic.forever(function on_forever() {
    if (sensor_is_bereit()) {
        sensor_messung()
        basic.showString("Temperatur: " + ("" + temperature))
        basic.showString("Luftfeuchtigkeit: " + ("" + humidity))
        basic.showString("CO2: " + ("" + co2))
    } else {
        basic.showString("Sensor nicht bereit")
    }
    
    basic.pause(1000)
})
