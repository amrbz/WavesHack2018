from flask import Blueprint
api = Blueprint('api', __name__)
from . import (
    authentication,
    errors,
    accounts,
    matcher,
    proofs,
)
