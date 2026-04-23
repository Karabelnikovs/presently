<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Presentation extends Model
{
    use HasFactory;

    // Atļautie lauki prezentācijas ieraksta izveidei.
    protected $fillable = ['user_id', 'title', 'filename'];

    public function user()
    {
        // Katra prezentācija ir saistīta ar vienu lietotāju.
        return $this->belongsTo(User::class);
    }
}