class UsersController < ApplicationController
  require 'rest_client'
  before_filter :authenticate_user!, except: [:callback, :final_callback, :test]

  def index
    @users = User.all
  end

  def show
    @user = User.find(params[:id])
    unless @user == current_user
      redirect_to :back, :alert => "Access denied."
    end
  end

  def test
  end

  def callback
  end

  def final_callback
    begin 
      response = RestClient.get 'http://api.spotify.com/v1/me', {:Authorization => "Bearer " + params[:access_token]}
      render json: response  
    rescue
      render text: "<script> window.location = 'https://accounts.spotify.com/authorize/?client_id=ee0f4eeffd6a4ce183a80baa066176f8&response_type=token&redirect_uri=http://lvh.me:3000/callback&scope=playlist-read-private playlist-modify-public playlist-modify-private user-library-modify user-library-read&state=b210jn0&show_dialog=true'</script>"
    end
  end

  def user_params
    params.require(:user).permit(:name, :tag_list) ## Rails 4 strong params usage
  end

end
