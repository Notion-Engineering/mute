class SimilarityCoefficient < ActiveRecord::Base
	belongs_to :user1, :class_name => "User", :foreign_key => "pearson_user1"
	belongs_to :user2, :class_name => "User", :foreign_key => "pearson_user2"
end
