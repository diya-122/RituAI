import asyncio
from main import chat_with_saheli, ChatRequest, ChatMessage

async def test():
    req = ChatRequest(messages=[
        ChatMessage(role='user', content='hello'),
        ChatMessage(role='saheli', content='namaste'),
        ChatMessage(role='user', content='how are you?')
    ])
    res = await chat_with_saheli(req)
    print(res)

asyncio.run(test())
