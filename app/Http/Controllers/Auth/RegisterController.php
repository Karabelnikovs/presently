<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Presentation;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class RegisterController extends Controller
{
    protected $redirectTo = '/';

    public function showRegistrationForm()
    {
        return view('app');
    }

    public function register(Request $request)
    {
        $this->validator($request->all())->validate();

        event(new Registered($user = $this->create($request->all())));

        $this->guard()->login($user);

        if ($response = $this->registered($request, $user)) {
            return $response;
        }

        return $request->wantsJson()
            ? new JsonResponse([], 201)
            : redirect($this->redirectPath());
    }

    protected function validator(array $data)
    {
        return Validator::make($data, [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);
    }

    protected function create(array $data)
    {
        return User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
        ]);
    }

    protected function guard()
    {
        return Auth::guard();
    }

    protected function registered(Request $request, $user)
    {
        $this->createDemoPresentations($user);

        if ($request->wantsJson()) {
            return response()->json(['message' => 'Registered', 'user' => $user]);
        }

        return redirect($this->redirectPath());
    }

    protected function redirectPath()
    {
        if (method_exists($this, 'redirectTo')) {
            return $this->redirectTo();
        }

        return property_exists($this, 'redirectTo') ? $this->redirectTo : '/home';
    }

    protected function createDemoPresentations(User $user): void
    {
        if ($user->presentations()->exists()) {
            return;
        }

        $sourceDir = resource_path('demo-presentations');
        if (!File::isDirectory($sourceDir)) {
            return;
        }

        $demoFiles = [
            ['title' => 'Welcome to Presently', 'file' => 'welcome-to-presently.pptx'],
            ['title' => 'Startup Pitch Deck Sample', 'file' => 'startup-pitch-deck-sample.pptx'],
            ['title' => 'Q2 Marketing Overview', 'file' => 'q2-marketing-overview.pptx'],
            ['title' => 'Product Roadmap 2026', 'file' => 'product-roadmap-2026.pptx'],
            ['title' => 'Team Weekly Update', 'file' => 'team-weekly-update.pptx'],
        ];

        foreach ($demoFiles as $demoFile) {
            $sourcePath = $sourceDir . DIRECTORY_SEPARATOR . $demoFile['file'];
            if (!File::exists($sourcePath)) {
                continue;
            }

            $storedFileName = 'demo_' . Str::uuid() . '.pptx';
            Storage::disk('public')->put($storedFileName, File::get($sourcePath));

            Presentation::create([
                'user_id' => $user->id,
                'title' => $demoFile['title'],
                'filename' => $storedFileName,
            ]);
        }
    }
}