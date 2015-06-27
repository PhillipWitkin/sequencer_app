class AddUserIdAndSequenceNameInSequences < ActiveRecord::Migration
  def change
    add_column :sequences, :user_id, :integer
    add_column :sequences, :sequence_name, :string
  end
end
