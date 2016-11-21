defmodule FlaskOnPhoenix.StickyTest do
  use FlaskOnPhoenix.ModelCase

  alias FlaskOnPhoenix.Sticky

  @valid_attrs %{angle: 42, color: "some content", group_angle: 42, group_height: 42, group_left: 42, group_scaleX: 42, group_scaleY: 42, group_top: 42, group_width: 42, height: 42, left: 42, scaleX: 42, scaleY: 42, text: "some content", top: 42, width: 42}
  @invalid_attrs %{}

  test "changeset with valid attributes" do
    changeset = Sticky.changeset(%Sticky{}, @valid_attrs)
    assert changeset.valid?
  end

  test "changeset with invalid attributes" do
    changeset = Sticky.changeset(%Sticky{}, @invalid_attrs)
    refute changeset.valid?
  end
end
