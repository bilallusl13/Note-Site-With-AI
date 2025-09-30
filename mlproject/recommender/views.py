from rest_framework.decorators import api_view
from rest_framework.response import Response
from sentence_transformers import SentenceTransformer
import numpy as np
import os
import json
model = SentenceTransformer('all-MiniLM-L6-v2')  # Küçük, hızlı, etkili model


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
topics_path = os.path.join(BASE_DIR, 'topics.json')

with open(topics_path, 'r', encoding='utf-8') as f:
    konular = json.load(f)
@api_view(["POST"])
def analyze_messages(request):
    messages = request.data.get("messages")
    if not messages or not isinstance(messages, list):
        return Response({"error": "messages bir liste olmalı"}, status=400)

    joined_text = " ".join(messages)
    user_embedding = model.encode(joined_text)

    konu_etiketleri = list(konular.keys())
    konu_metni = list(konular.values())  # zaten string

    konu_embedding = model.encode(konu_metni)

    def cosine_similarity(a, b):
        return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

    benzerlikler = [cosine_similarity(user_embedding, ke) for ke in konu_embedding]

    # Benzerlik ve konu etiketlerini eşleştir, sonra sırala
    benzerlik_ve_konular = list(zip(benzerlikler, konu_etiketleri))

    # En yüksek 3 benzerlik
    benzerlik_ve_konular.sort(key=lambda x: x[0], reverse=True)
    top3 = benzerlik_ve_konular[:3]

    # Önerileri hem konu adı hem benzerlik ile gönder
    oneriler = [{"konu": konu, "benzerlik": round(score, 3), "icerik": konular[konu]} for score, konu in top3]

    return Response({"öneriler": oneriler})
