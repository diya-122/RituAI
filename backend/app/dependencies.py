from fastapi import Request
from prisma import Prisma


def get_db(request: Request) -> Prisma:
    return request.app.state.db
