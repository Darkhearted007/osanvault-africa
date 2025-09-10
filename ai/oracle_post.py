import time
while True:
    with open('../messages/ifa_messages.txt','r') as f:
        msg = f.read()
    print("Posting Ifa esoteric message to Telegram:", msg)
    time.sleep(21600)
