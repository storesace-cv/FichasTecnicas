from flask import Blueprint, jsonify, request

from models import PricingPolicy, db


pricing_policy_bp = Blueprint("pricing_policy", __name__, url_prefix="/api/pricing-policy")


ALLOWED_POLICIES = {
    "classic": "Arredondamento Comercial Clássico",
    "psychological": "Psychological Pricing",
    "premium": "Arredondamento Premium",
    "strictEuro": "Arredondamento rígido ao euro",
    "nearestMultiple": "Arredondamento ao múltiplo mais próximo",
    "minimumMargin": "Garantia de margem mínima",
    "corporate": "Arredondamento corporativo",
}


DEFAULT_POLICY_BY_COUNTRY = {
    "Portugal": "nearestMultiple",
    "Angola": "premium",
    "Cabo Verde": "classic",
}


def _get_current_policy():
    return PricingPolicy.query.order_by(PricingPolicy.Id.asc()).first()


def _serialize_policy(policy: PricingPolicy):
    if not policy:
        return {"policyKey": None, "country": None, "manualOverride": False}
    return policy.serialize()


@pricing_policy_bp.route("", methods=["GET"])
def get_pricing_policy():
    policy = _get_current_policy()
    return jsonify(_serialize_policy(policy))


@pricing_policy_bp.route("", methods=["PUT", "POST"])
def set_pricing_policy():
    payload = request.get_json(force=True, silent=True) or {}
    policy_key = payload.get("policyKey")

    if policy_key not in ALLOWED_POLICIES:
        return (
            jsonify(
                {
                    "error": "Política de preços inválida.",
                    "permitidas": list(ALLOWED_POLICIES.keys()),
                }
            ),
            400,
        )

    manual_override = bool(payload.get("manualOverride", True))
    country = payload.get("country")

    policy = _get_current_policy()
    if not policy:
        policy = PricingPolicy()

    policy.PolicyKey = policy_key
    policy.Country = country
    policy.ManualOverride = manual_override

    db.session.add(policy)
    db.session.commit()

    return jsonify(_serialize_policy(policy))


@pricing_policy_bp.route("/apply-default", methods=["POST"])
def apply_default_pricing_policy():
    payload = request.get_json(force=True, silent=True) or {}
    country = payload.get("country")

    existing_policy = _get_current_policy()
    if existing_policy:
        return jsonify(_serialize_policy(existing_policy))

    default_policy = DEFAULT_POLICY_BY_COUNTRY.get(country) or DEFAULT_POLICY_BY_COUNTRY.get(
        "Portugal"
    )

    policy = PricingPolicy(
        PolicyKey=default_policy,
        Country=country,
        ManualOverride=False,
    )

    db.session.add(policy)
    db.session.commit()

    return jsonify(_serialize_policy(policy)), 201

