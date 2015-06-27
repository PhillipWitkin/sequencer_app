class RemoveUserIdInSequences < ActiveRecord::Migration
  def change
    remove_column :sequences, :user_id, :string
  end
end
