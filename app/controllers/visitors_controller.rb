class VisitorsController < ApplicationController

  	def index
  		@code = params[:code] 
  	end

	def r_json
		render json: params
		#s = request.original_url
		#s = s.gsub!('#','?')
		#s = s.gsub!('json','callback')
		#redirect_to s
	end
end
