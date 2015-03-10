Rails.application.routes.draw do
  root to: 'visitors#index'
  devise_for :users
  resources :users

  get '/callback' => 'users#callback'
  get '/callback/final' => 'users#final_callback'
  get '/test' => 'users#test'
  get '/json' => 'visitors#r_json'
end
