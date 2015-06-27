class CreateSequences < ActiveRecord::Migration
  def change
    create_table :sequences do |t|
      t.string :user_id

      t.string :sb_1_pitch
      t.string :sb_1_duration

      t.string :sb_2_pitch
      t.string :sb_2_duration

      t.string :sb_3_pitch
      t.string :sb_3_duration

      t.string :sb_4_pitch
      t.string :sb_4_duration

      t.string :sb_5_pitch
      t.string :sb_5_duration

      t.string :sb_6_pitch
      t.string :sb_6_duration

      t.string :sb_7_pitch
      t.string :sb_7_duration

      t.string :sb_8_pitch
      t.string :sb_8_duration

      t.string :sb_9_pitch
      t.string :sb_9_duration

      t.string :sb_10_pitch
      t.string :sb_10_duration

      t.string :sb_11_pitch
      t.string :sb_11_duration

      t.string :sb_12_pitch
      t.string :sb_12_duration

      t.string :sb_13_pitch
      t.string :sb_13_duration

      t.string :sb_14_pitch
      t.string :sb_14_duration

      t.string :sb_15_pitch
      t.string :sb_15_duration

      t.string :sb_16_pitch
      t.string :sb_16_duration

      t.timestamps null: false
    end
  end
end
