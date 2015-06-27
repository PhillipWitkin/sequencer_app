class AddNoteBlock5InSequences < ActiveRecord::Migration
  def change
    add_column :sequences, :sb_5_note, :string
  end
end
