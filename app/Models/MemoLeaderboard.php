<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MemoLeaderboard extends Model
{
    use HasFactory;

    // Tabula memo spēles rezultātu glabāšanai.
    protected $table = 'memo_leaderboard';

    protected $fillable = [
        'user_id',
        'score',
        'base_score',
        'completion_seconds',
        'moves',
        'hint_used',
    ];

    public function user()
    {
        // Rezultāts pieder konkrētam lietotājam.
        return $this->belongsTo(User::class);
    }
}
