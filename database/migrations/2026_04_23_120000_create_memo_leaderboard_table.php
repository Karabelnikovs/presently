<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('memo_leaderboard', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('score');
            $table->unsignedInteger('base_score');
            $table->unsignedSmallInteger('completion_seconds');
            $table->unsignedSmallInteger('moves');
            $table->boolean('hint_used')->default(false);
            $table->timestamps();

            $table->index(['score', 'completion_seconds']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('memo_leaderboard');
    }
};
