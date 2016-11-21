defmodule FlaskOnPhoenix.Sticky do
  use FlaskOnPhoenix.Web, :model

  schema "stickys" do
    field :color, :string
    field :text, :string
    field :left, :integer
    field :top, :integer
    field :width, :integer
    field :height, :integer
    field :scaleX, :integer
    field :scaleY, :integer
    field :angle, :integer
    field :group_left, :integer
    field :group_top, :integer
    field :group_width, :integer
    field :group_height, :integer
    field :group_scaleX, :integer
    field :group_scaleY, :integer
    field :group_angle, :integer

    timestamps()
  end

  @doc """
  Builds a changeset based on the `struct` and `params`.
  """
  def changeset(struct, params \\ %{}) do
    struct
    |> cast(params, [:color, :text, :left, :top, :width, :height, :scaleX, :scaleY, :angle, :group_left, :group_top, :group_width, :group_height, :group_scaleX, :group_scaleY, :group_angle])
    |> validate_required([:color, :text, :left, :top, :width, :height, :scaleX, :scaleY, :angle, :group_left, :group_top, :group_width, :group_height, :group_scaleX, :group_scaleY, :group_angle])
  end
end
