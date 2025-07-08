from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    ROLES = (
        ('ADMIN', 'Admin'),
        ('BAYI', 'Bayi'),
        ('KURUM', 'Kurum'),
        ('OGRETMEN', 'Ogretmen'),
        ('OGRENCI', 'Ogrenci'),
    )
    role = models.CharField(max_length=10, choices=ROLES)
    groups = models.ManyToManyField(
        'auth.Group',
        verbose_name='groups',
        blank=True,
        help_text=
            'The groups this user belongs to. A user will get all permissions '
            'granted to each of their groups.',
        related_name="core_user_set",
        related_query_name="user",
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        verbose_name='user permissions',
        blank=True,
        help_text='Specific permissions for this user.',
        related_name="core_user_set",
        related_query_name="user",
    )
    # Add any other user-related fields here

class Taxonomy(models.Model):
    ders_kodu = models.CharField(max_length=10)
    sinif_kodu = models.CharField(max_length=10)
    tema_kodu = models.CharField(max_length=10, blank=True, null=True)
    unite_kodu = models.CharField(max_length=10, blank=True, null=True)
    ogrenim_ciktisi_kodu = models.CharField(max_length=10)
    # Add other taxonomy fields as needed

    def __str__(self):
        return f"{self.ders_kodu}.{self.sinif_kodu}.{self.tema_kodu or self.unite_kodu}.{self.ogrenim_ciktisi_kodu}"

class Question(models.Model):
    taxonomy = models.ForeignKey(Taxonomy, on_delete=models.CASCADE)
    question_text = models.TextField()
    difficulty_score = models.IntegerField()
    # Add other question-related fields here

    def __str__(self):
        return self.question_text

class Test(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    questions = models.ManyToManyField(Question)
    created_at = models.DateTimeField(auto_now_add=True)
    # Add other test-related fields here

class UserCredit(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    balance = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.user.username} - {self.balance}"