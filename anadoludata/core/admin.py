from django.contrib import admin
from .models import User, Taxonomy, Question, Test, UserCredit

admin.site.register(User)
admin.site.register(Taxonomy)
admin.site.register(Question)
admin.site.register(Test)
admin.site.register(UserCredit)