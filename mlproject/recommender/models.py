from django.db import models

# Create your models here.
from django.db import models

class Usermessage(models.Model):
    user_id=models.IntegerField()
    message= models.TextField()
    created_at= models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user_id}-{self.message[:30]}"