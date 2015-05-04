class CreateSimilarityCoefficients < ActiveRecord::Migration
  def change
    create_table :similarity_coefficients do |t|
      t.integer :user1
      t.integer :user2
      t.float :coefficient

      t.timestamps null: false
    end
  end
end
