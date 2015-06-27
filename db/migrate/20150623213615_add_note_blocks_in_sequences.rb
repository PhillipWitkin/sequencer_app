class AddNoteBlocksInSequences < ActiveRecord::Migration
  def change
    add_column :sequences, :sb_1_note, :string
    add_column :sequences, :sb_2_note, :string
    add_column :sequences, :sb_3_note, :string
    add_column :sequences, :sb_4_note, :string
    add_column :sequences, :sb_6_note, :string
    add_column :sequences, :sb_7_note, :string
    add_column :sequences, :sb_8_note, :string
    add_column :sequences, :sb_9_note, :string
    add_column :sequences, :sb_10_note, :string
    add_column :sequences, :sb_11_note, :string
    add_column :sequences, :sb_12_note, :string
    add_column :sequences, :sb_13_note, :string
    add_column :sequences, :sb_14_note, :string
    add_column :sequences, :sb_15_note, :string
    add_column :sequences, :sb_16_note, :string
  end
end
