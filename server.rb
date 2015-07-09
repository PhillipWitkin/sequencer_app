require 'sinatra'
require 'sinatra/activerecord'
require 'active_record'
require 'json'
# require 'pry'
require 'bcrypt'

# set :database, 'postgres://phillipwitkin@localhost/sequencer_sinatra'
require './config/environments'

class Sequence < ActiveRecord::Base
  belongs_to :user

  validates :sequence_name, presence: true
  # validates :sequence_name, uniqueness: true, if: :sequence_name_for_user_already_taken?

  # def sequence_name_for_user_already_taken?
  #   Sequence.user_id == current_user[:id] 
  # end
end

class User < ActiveRecord::Base
  has_secure_password
  
  has_many :sequences

  validates :username, presence: true
  validates :username, uniqueness: true
end

# enable :sessions
set :sessions, true

helpers do
  def current_user
    if session[:user_id]
      @current_user ||= User.find(session[:user_id])
    else
      false
    end
  end

  def logged_in?
    current_user.present?
  end
end

#login form
get ('/login') do
  erb :index
end

#new user form
get ('/new_user') do
  erb :new
end

#ceate a new username
post ('/new_user') do
  user = User.new(
    username: params[:username],
    password: params[:password]
  )

  if user.save
    #create some stock sequences for the new user
    Sequence.create(
      user_id: user[:id],
      sequence_name: "Octave Shift",

      sb_1_pitch: "440",
      sb_1_duration: "1/4",
      sb_1_note: "A4",

      sb_2_pitch: "440",
      sb_2_duration: "1/4",
      sb_2_note: "A4",

      sb_3_pitch: "880",
      sb_3_duration: "1/4",
      sb_3_note: "A5",

      sb_4_pitch: "880",
      sb_4_duration: "1/4",
      sb_4_note: "A5",

      sb_5_pitch: "440",
      sb_5_duration: "1/4",
      sb_5_note: "A4",

      sb_6_pitch: "440",
      sb_6_duration: "1/4",
      sb_6_note: "A4",

      sb_7_pitch: "880",
      sb_7_duration: "1/4",
      sb_7_note: "A5",

      sb_8_pitch: "880",
      sb_8_duration: "1/4",
      sb_8_note: "A5",

      sb_9_pitch: "440",
      sb_9_duration: "1/4",
      sb_9_note: "A4",

      sb_10_pitch: "440",
      sb_10_duration: "1/4",
      sb_10_note: "A4",

      sb_11_pitch: "880",
      sb_11_duration: "1/4",
      sb_11_note: "A5",

      sb_12_pitch: "880",
      sb_12_duration: "1/4",
      sb_12_note: "A5",

      sb_13_pitch: "440",
      sb_13_duration: "1/4",
      sb_13_note: "A4",

      sb_14_pitch: "440",
      sb_14_duration: "1/4",
      sb_14_note: "A4",

      sb_15_pitch: "880",
      sb_15_duration: "1/4",
      sb_15_note: "A5",

      sb_16_pitch: "880",
      sb_16_duration: "1/4",
      sb_16_note: "A5"
    )

    Sequence.create(
      user_id: user[:id],
      sequence_name: "Default E4",

      sb_1_pitch: "329.62755691",
      sb_1_duration: "1/4",
      sb_1_note: "E4",

      sb_2_pitch: "329.62755691",
      sb_2_duration: "1/4",
      sb_2_note: "E4",

      sb_3_pitch: "329.62755691",
      sb_3_duration: "1/4",
      sb_3_note: "E4",

      sb_4_pitch: "329.62755691",
      sb_4_duration: "1/4",
      sb_4_note: "E4",

      sb_5_pitch: "329.62755691",
      sb_5_duration: "1/4",
      sb_5_note: "E4",

      sb_6_pitch: "329.62755691",
      sb_6_duration: "1/4",
      sb_6_note: "E4",

      sb_7_pitch: "329.62755691",
      sb_7_duration: "1/4",
      sb_7_note: "E4",

      sb_8_pitch: "329.62755691",
      sb_8_duration: "1/4",
      sb_8_note: "E4",

      sb_9_pitch: "329.62755691",
      sb_9_duration: "1/4",
      sb_9_note: "E4",

      sb_10_pitch: "329.62755691",
      sb_10_duration: "1/4",
      sb_10_note: "E4",

      sb_11_pitch: "329.62755691",
      sb_11_duration: "1/4",
      sb_11_note: "E4",

      sb_12_pitch: "329.62755691",
      sb_12_duration: "1/4",
      sb_12_note: "E4",

      sb_13_pitch: "329.62755691",
      sb_13_duration: "1/4",
      sb_13_note: "E4",

      sb_14_pitch: "329.62755691",
      sb_14_duration: "1/4",
      sb_14_note: "E4",

      sb_15_pitch: "329.62755691",
      sb_15_duration: "1/4",
      sb_15_note: "E4",

      sb_16_pitch: "329.62755691",
      sb_16_duration: "1/4",
      sb_16_note: "E4"
    )

    Sequence.create(
      user_id: user[:id],
      sequence_name: "C Major Scale",

      sb_1_pitch: "261.625565",
      sb_1_duration: "1/4",
      sb_1_note: "C4",

      sb_2_pitch: "293.6647",
      sb_2_duration: "1/4",
      sb_2_note: "D4",

      sb_3_pitch: "329.62755691",
      sb_3_duration: "1/4",
      sb_3_note: "E4",

      sb_4_pitch: "349.2282",
      sb_4_duration: "1/4",
      sb_4_note: "F4",

      sb_5_pitch: "391.9954",
      sb_5_duration: "1/4",
      sb_5_note: "G4",

      sb_6_pitch: "440",
      sb_6_duration: "1/4",
      sb_6_note: "A4",

      sb_7_pitch: "493.8833",
      sb_7_duration: "1/4",
      sb_7_note: "B4",

      sb_8_pitch: "523.25113",
      sb_8_duration: "1/4",
      sb_8_note: "C5",

      sb_9_pitch: "523.25113",
      sb_9_duration: "1/4",
      sb_9_note: "C5",

      sb_10_pitch: "493.8833",
      sb_10_duration: "1/4",
      sb_10_note: "B4",

      sb_11_pitch: "440",
      sb_11_duration: "1/4",
      sb_11_note: "A4",

      sb_12_pitch: "391.9954",
      sb_12_duration: "1/4",
      sb_12_note: "G4",

      sb_13_pitch: "349.2282",
      sb_13_duration: "1/4",
      sb_13_note: "F4",

      sb_14_pitch: "329.62755691",
      sb_14_duration: "1/4",
      sb_14_note: "E4",

      sb_15_pitch: "293.6647",
      sb_15_duration: "1/4",
      sb_15_note: "D4",

      sb_16_pitch: "261.625565",
      sb_16_duration: "1/4",
      sb_16_note: "C4"
    )

    redirect "/login"
  else
        # @message = "That's not gonna fly"
    @message = user.errors.full_messages[0]
    erb :new
  end

end

#check login
post ('/login') do
  # checking for presence of user in DB
    user = User.find_by(username: params[:username])
    # binding.pry
    if user && user.authenticate(params[:password])

      session[:user_id] = user.id
      redirect "/"
     
    else
      @message = "Sorry, the password entered does not match the username"
      erb :index
      # redirect "/login" 
    end
  
end

#logout
delete ('/login') do
  session[:user_id] = nil  
  redirect "/login"
end

get ('/logout') do
  session[:user_id] = nil
  # @message = "Hope to sequence you again soon"  
  redirect "/login"
end


#main page
get ('/') do
  if logged_in?
    # index = File.read("./public/static_views/main.html")
    # html = index
    current_user
    erb :main
  else
    redirect "/login"
  end
end

#all sequences for a user
get ('/api/sequences') do
  content_type :json

  all_sequences = Sequence.all().joins(:user).where(user_id: current_user[:id]) 
  all_sequences.to_json(include:{
    user: {only: [:username]},
  })

end

#one sequence belonging to the user to load
get ('/api/sequences/:id') do
  content_type :json
  sequence = Sequence.find(params[:id])
  sequence.to_json
end

#save the currently loaded sequence
put ('/api/sequences/:id') do
  content_type :json
  changing_sequence = Sequence.find(params[:id])

  changing_sequence.update(
    sb_1_pitch: params[:sb_1_pitch],
    sb_1_duration: params[:sb_1_duration],
    sb_1_note: params[:sb_1_note],

    sb_2_pitch: params[:sb_2_pitch],
    sb_2_duration: params[:sb_2_duration],
    sb_2_note: params[:sb_2_note],

    sb_3_pitch: params[:sb_3_pitch],
    sb_3_duration: params[:sb_3_duration],
    sb_3_note: params[:sb_3_note],

    sb_4_pitch: params[:sb_4_pitch],
    sb_4_duration: params[:sb_4_duration],
    sb_4_note: params[:sb_4_note],

    sb_5_pitch: params[:sb_5_pitch],
    sb_5_duration: params[:sb_5_duration],
    sb_5_note: params[:sb_5_note],

    sb_6_pitch: params[:sb_6_pitch],
    sb_6_duration: params[:sb_6_duration],
    sb_6_note: params[:sb_6_note],

    sb_7_pitch: params[:sb_7_pitch],
    sb_7_duration: params[:sb_7_duration],
    sb_7_note: params[:sb_7_note],

    sb_8_pitch: params[:sb_8_pitch],
    sb_8_duration: params[:sb_8_duration],
    sb_8_note: params[:sb_8_note],

    sb_9_pitch: params[:sb_9_pitch],
    sb_9_duration: params[:sb_9_duration],
    sb_9_note: params[:sb_9_note],

    sb_10_pitch: params[:sb_10_pitch],
    sb_10_duration: params[:sb_10_duration],
    sb_10_note: params[:sb_10_note],

    sb_11_pitch: params[:sb_11_pitch],
    sb_11_duration: params[:sb_11_duration],
    sb_11_note: params[:sb_11_note],

    sb_12_pitch: params[:sb_12_pitch],
    sb_12_duration: params[:sb_12_duration],
    sb_12_note: params[:sb_12_note],

    sb_13_pitch: params[:sb_13_pitch],
    sb_13_duration: params[:sb_13_duration],
    sb_13_note: params[:sb_13_note],

    sb_14_pitch: params[:sb_14_pitch],
    sb_14_duration: params[:sb_14_duration],
    sb_14_note: params[:sb_14_note],

    sb_15_pitch: params[:sb_15_pitch],
    sb_15_duration: params[:sb_15_duration],
    sb_15_note: params[:sb_15_note],

    sb_16_pitch: params[:sb_16_pitch],
    sb_16_duration: params[:sb_16_duration],
    sb_16_note: params[:sb_16_note]
  )

  puts params
  changing_sequence.to_json
end

#save the current sequence under a new title
post ('/api/sequences') do
  content_type :json
  new_sequence = Sequence.new(
    user_id: current_user[:id],
    sequence_name: params[:sequence_name],

    sb_1_pitch: params[:sb_1_pitch],
    sb_1_duration: params[:sb_1_duration],
    sb_1_note: params[:sb_1_note],

    sb_2_pitch: params[:sb_2_pitch],
    sb_2_duration: params[:sb_2_duration],
    sb_2_note: params[:sb_2_note],

    sb_3_pitch: params[:sb_3_pitch],
    sb_3_duration: params[:sb_3_duration],
    sb_3_note: params[:sb_3_note],

    sb_4_pitch: params[:sb_4_pitch],
    sb_4_duration: params[:sb_4_duration],
    sb_4_note: params[:sb_4_note],

    sb_5_pitch: params[:sb_5_pitch],
    sb_5_duration: params[:sb_5_duration],
    sb_5_note: params[:sb_5_note],

    sb_6_pitch: params[:sb_6_pitch],
    sb_6_duration: params[:sb_6_duration],
    sb_6_note: params[:sb_6_note],

    sb_7_pitch: params[:sb_7_pitch],
    sb_7_duration: params[:sb_7_duration],
    sb_7_note: params[:sb_7_note],

    sb_8_pitch: params[:sb_8_pitch],
    sb_8_duration: params[:sb_8_duration],
    sb_8_note: params[:sb_8_note],

    sb_9_pitch: params[:sb_9_pitch],
    sb_9_duration: params[:sb_9_duration],
    sb_9_note: params[:sb_9_note],

    sb_10_pitch: params[:sb_10_pitch],
    sb_10_duration: params[:sb_10_duration],
    sb_10_note: params[:sb_10_note],

    sb_11_pitch: params[:sb_11_pitch],
    sb_11_duration: params[:sb_11_duration],
    sb_11_note: params[:sb_11_note],

    sb_12_pitch: params[:sb_12_pitch],
    sb_12_duration: params[:sb_12_duration],
    sb_12_note: params[:sb_12_note],

    sb_13_pitch: params[:sb_13_pitch],
    sb_13_duration: params[:sb_13_duration],
    sb_13_note: params[:sb_13_note],

    sb_14_pitch: params[:sb_14_pitch],
    sb_14_duration: params[:sb_14_duration],
    sb_14_note: params[:sb_14_note],

    sb_15_pitch: params[:sb_15_pitch],
    sb_15_duration: params[:sb_15_duration],
    sb_15_note: params[:sb_15_note],

    sb_16_pitch: params[:sb_16_pitch],
    sb_16_duration: params[:sb_16_duration],
    sb_16_note: params[:sb_16_note]
  )
  if new_sequence.save
    new_sequence.to_json
  end
end
