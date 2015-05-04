class User < ActiveRecord::Base
  require 'acts-as-taggable-on'

  has_many :SimilarityCoefficients
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable and :omniauthable
  devise :database_authenticatable, :registerable, :confirmable,
         :recoverable, :rememberable, :trackable, :validatable
  acts_as_taggable
  acts_as_taggable_on :bands

  def pearson a, b
		person = []
		person[0] = a
		person[1] = b
		tastes = []
		aux = []
		aux[0] = []
		aux[1] = []
		aux[6] = []
		aux[7] = []
		aux[8] = 0
		aux[9] = 0
		xy = 0
		i = 0

		tastes = person[0] + person[1]
		tastes = tastes.uniq # Drop repeated values

		# Asign 20 if exists or 1 if not
		tastes.each do |p|
			if( person[0].include?(p.to_s) )
				aux[6].push 20
			else
				aux[6].push 1
		 	end
		 	if( person[1].include?(p.to_s) )
				aux[7].push 20
			else
				aux[7].push 1
		 	end
		end

		aux[0] = person[0] & person[1] # Similarities
		aux[1] = person[1] & person[0] # Similarities

		aux[2] = person[0] - person[1] # Unequal
		aux[3] = person[1] - person[0] # Unequal

		aux[4] = (aux[0].count * 2) + aux[2].count # Sum of x
		aux[5] = (aux[1].count * 2) + aux[3].count # Sum of y

		aux[6].each do |v|
			aux[8] += v.to_i**2 # Sum of the square of person 1 data
			xy += v * aux[7][i].to_i
			aux[9] += aux[7][i]**2
			i += 1
		end
		
		up = tastes.count * (xy) - (aux[4] * aux[5])
		down_1 = Math.sqrt( (tastes.count * aux[8].to_i) - aux[4]**2 )
		down_2 = Math.sqrt( (tastes.count * aux[9].to_i) - aux[5]**2 )

		r = up / (down_1 * down_2)
		
		puts aux.to_s
		return r
	end



end
