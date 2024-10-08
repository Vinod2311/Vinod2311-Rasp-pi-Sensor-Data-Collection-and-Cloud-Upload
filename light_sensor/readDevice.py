import smbus 

#Address for settings
DEVICE     = 0x23 
POWER_DOWN = 0x00 
POWER_ON   = 0x01 
RESET      = 0x07 
CONTINUOUS_LOW_RES_MODE = 0x13 
CONTINUOUS_HIGH_RES_MODE_1 = 0x10 
CONTINUOUS_HIGH_RES_MODE_2 = 0x11 
ONE_TIME_HIGH_RES_MODE_1 = 0x20 
ONE_TIME_HIGH_RES_MODE_2 = 0x21 
ONE_TIME_LOW_RES_MODE = 0x23 

bus = smbus.SMBus(1) 

#Convert byte to number
def convertToNumber(data):  
  result=(data[1] + (256 * data[0])) / 1.2 
  return result 

def readDevice(addr=DEVICE):  
  data = bus.read_i2c_block_data(addr, ONE_TIME_HIGH_RES_MODE_1) 
  return convertToNumber(data) 



def readLightIntensity():    
  try: 
    lightLevel = round(readDevice(),2)
    
  except RuntimeError as err:
      error = err.args[0]
      print(error)
  return lightLevel

readLightIntensity() 

