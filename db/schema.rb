# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20150623232220) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "sequences", force: :cascade do |t|
    t.string   "sb_1_pitch"
    t.string   "sb_1_duration"
    t.string   "sb_2_pitch"
    t.string   "sb_2_duration"
    t.string   "sb_3_pitch"
    t.string   "sb_3_duration"
    t.string   "sb_4_pitch"
    t.string   "sb_4_duration"
    t.string   "sb_5_pitch"
    t.string   "sb_5_duration"
    t.string   "sb_6_pitch"
    t.string   "sb_6_duration"
    t.string   "sb_7_pitch"
    t.string   "sb_7_duration"
    t.string   "sb_8_pitch"
    t.string   "sb_8_duration"
    t.string   "sb_9_pitch"
    t.string   "sb_9_duration"
    t.string   "sb_10_pitch"
    t.string   "sb_10_duration"
    t.string   "sb_11_pitch"
    t.string   "sb_11_duration"
    t.string   "sb_12_pitch"
    t.string   "sb_12_duration"
    t.string   "sb_13_pitch"
    t.string   "sb_13_duration"
    t.string   "sb_14_pitch"
    t.string   "sb_14_duration"
    t.string   "sb_15_pitch"
    t.string   "sb_15_duration"
    t.string   "sb_16_pitch"
    t.string   "sb_16_duration"
    t.datetime "created_at",     null: false
    t.datetime "updated_at",     null: false
    t.integer  "user_id"
    t.string   "sequence_name"
    t.string   "sb_1_note"
    t.string   "sb_2_note"
    t.string   "sb_3_note"
    t.string   "sb_4_note"
    t.string   "sb_6_note"
    t.string   "sb_7_note"
    t.string   "sb_8_note"
    t.string   "sb_9_note"
    t.string   "sb_10_note"
    t.string   "sb_11_note"
    t.string   "sb_12_note"
    t.string   "sb_13_note"
    t.string   "sb_14_note"
    t.string   "sb_15_note"
    t.string   "sb_16_note"
    t.string   "sb_5_note"
  end

  create_table "users", force: :cascade do |t|
    t.string   "username"
    t.string   "password_digest"
    t.boolean  "admin",           default: false
    t.datetime "created_at",                      null: false
    t.datetime "updated_at",                      null: false
  end

end
