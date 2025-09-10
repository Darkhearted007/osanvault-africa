import time
while True:
    with open('../investor/posts.txt','r') as f:
        post = f.read()
    print("Posting investor update:", post)
    time.sleep(21600)
